from collections import deque
from Models import Task, MergedData, ChartRecommendations
from DataLoader import DataLoader
import pandas as pd
import threading
from appsetup import TaskStatus, db
import time

class TasksProcessor:
    def __init__(self, db):
        self.task_queue = deque()
        self.db = db
        self.shutdown_event = threading.Event()
        self.threads = []

    def get_tasks(self):
        try:
            tasks = Task.query.all()
            tasks_dict = []
            for task in tasks:
                tasks_dict.append({
                    "task_id": task.task_id,
                    "name": task.name,
                    "srcA": task.srcA,
                    "srcB": task.srcB, 
                    "status": task.status.value,
                    "dateCreated": task.created_at.strftime('%m/%d/%Y')
                })
            return tasks_dict
        except Exception as e:
            raise Exception("Error while fetching tasks.")
        

    def create_task(self, data):
        try:
            error = ""
            if 'name' not in data: error += "The task must have a name. \n"
            # if 'srcA' not in data: error += "Data source A is not selected. \n"
            # if 'srcB' not in data: error += "Data source B is not selected. \n"
            # if 'data_folder' not in data: error += "Data folder not selected. \n"

            if error: return {"error": error}


            new_task = Task(
                name=data.get('name'),
                filters=data.get('filters', None),
                srcA=data.get('srcA'),
                srcB=data.get('srcB'),
                # data_folder=data.get('data_folder')
            )


            self.db.session.add(new_task)
            self.db.session.commit()

            return {
                "id": new_task.task_id, 
                "name": new_task.name
            }

        except Exception as e:
            return {"error": str(e)}
    
    def apply_filters(self, df, filters):
        for column in df.columns:
            if 'date' in column:
                df[column] = pd.to_datetime(df[column])
            if "id" in column.lower():
                df.drop(column, axis=1, inplace=True)
            if column in filters:
                if 'date' in column:
                    start_date, end_date = filters[column][0], filters[column][1]
                    df = df[(df[column] >= start_date) & (df[column] <= end_date)]
                elif not pd.api.types.is_numeric_dtype(df[column]):
                    if filters[column]: df = df[df[column].isin(filters[column])]
                else:
                    min_val, max_val = filters[column][0], filters[column][1]
                    df = df[(df[column] >= min_val) & (df[column] <= max_val)]
        return df
    
    def save_df_on_disk(self, df):
        pass

    def save_task_in_db(self, merged_df, srcA, srcB, srcA_name, srcB_name, task_id):
        records_to_insert = []
        for _, row in merged_df.iterrows():
            row_dict = {}
            for col in merged_df.columns:
                if "id" in col: continue
                col_name = col
                if("date" not in col and (not col.endswith("_srcA")) and (not col.endswith("_srcB"))): 
                    if col in srcA.columns: col_name = col + "_srcA"
                    else: col_name = col + "_srcB"
                row_dict[col_name] = row[col]
            if row_dict:
                records_to_insert.append(
                    {
                        "task_id": task_id, 
                        "df1_name": srcA_name, 
                        "df2_name": srcB_name, 
                        "row_value": row_dict
                    }
                )
        self.db.session.bulk_insert_mappings(MergedData, records_to_insert)
        self.db.session.commit()

    def process_jobs(self):
        from app import app
        with app.app_context():
            while True:
                if self.task_queue:
                    task_id = self.task_queue.pop()
                    task = Task.query.filter_by(task_id=task_id).first()
                    if task:
                        try:
                            task.status = TaskStatus.INPROGRESS
                            db.session.commit()
                            print(f"Processing: {task.name} in {threading.current_thread().name}. Starting....")
                            data_loader = DataLoader()
                            srcA_df = self.apply_filters(data_loader.load_data(task.srcA), task.filters[task.srcA])
                            srcB_df = self.apply_filters(data_loader.load_data(task.srcB), task.filters[task.srcB])
                            date_col = self.get_date_column(srcA_df)
                            common_cols = self.get_common_cols(srcA_df, srcB_df)
                            merged_df = pd.merge(srcA_df, srcB_df, on=date_col, how='inner', suffixes=('_srcA', '_srcB'))
                            merged_df = merged_df[common_cols]
                            merged_df[date_col] = merged_df[date_col].dt.strftime('%Y-%m-%d')
                            print(f"Processing: {task.name}. Applied filters. Saving the filtered data to the database..")
                            self.save_task_in_db(merged_df, srcA_df, srcB_df, task.srcA, task.srcB, task_id)
                            task.status = TaskStatus.COMPLETED
                            time.sleep(30)
                            db.session.commit()
                            print(f"Processing: {task.name}. Status: Completed")
                        except Exception as e:
                            task.status = TaskStatus.FAILED
                            db.session.commit()
                            print(f"Processing: {task.name}. Status: Failed")
                time.sleep(30)


    def start_task(self, task_id):
        self.task_queue.append(task_id)
    
    def get_common_cols(self, srcA_df, srcB_df):
        common_cols = srcA_df.columns.intersection(srcB_df.columns).tolist()
        changed_common_cols = []
        for col in common_cols:
            if "date" not in col: 
                changed_common_cols.append(col + "_srcA")
                changed_common_cols.append(col + "_srcB")
            else:
                changed_common_cols.append(col)
        return changed_common_cols
    
    def save_chart_recommendations(self, task_id, chartrecommendations):
        try:
            chart_rec = ChartRecommendations(
                task_id=task_id,
                recommendation = chartrecommendations
            )

            db.session.add(chart_rec)
            db.session.commit()

            return {"message": f"Task started successfully."}
        except Exception as e:
            raise e

    def get_date_column(self, df):
        for column in df.columns:
            if 'date' in column: return column

    def start_processing(self):
        for i in range(2):
            thread = threading.Thread(target=self.process_jobs, daemon=True, name=f"Thread {i}")
            thread.start()
            self.threads.append(thread)

    def shutdown(self):
        print("Shutting down task processor...")
        self.shutdown_event.set()
        for thread in self.threads:
            thread.join()
        print("Task processor shutdown complete.")
        
    def delete_task(self, task_id):
        try:
            task = Task.query.filter_by(task_id=task_id).first()
            if task:
                db.session.delete(task)
                db.session.commit()
        except Exception as e:
            raise e
