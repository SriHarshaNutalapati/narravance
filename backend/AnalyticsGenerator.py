import os
import pandas as pd
import json
from flask import jsonify
from appsetup import db
from Models import MergedData, ChartRecommendations
from DataProcessor import DataProcessor
import random, string


class AnalyticsGenerator:
    def __init__(self, data):
        self.task_id = data["task_id"]
        self.get_data()
        self.charts = self.get_chart_recommendation()
        
    def get_time_series_data(self, data):
        
        date_column = data['date_column']
        value_columns_str = data['value_columns']
        value_columns = [col.strip() for col in value_columns_str.split(',')]
        aggregation = data.get('aggregation', 'sum')
        
        df = self.df
        
        # Apply filterss
        
        df[date_column] = pd.to_datetime(df[date_column])
        df['year'] = pd.to_datetime(df[date_column]).dt.year
        
        for col in value_columns:
            if col in df.columns:
                df[col] = df[col].apply(lambda x: None if pd.isna(x) else x)
        
        grouped = df.groupby('year')
        
        date_data_dict = {}
        
        for value_column in value_columns:
            if value_column not in df.columns:
                continue
                
            if aggregation == 'sum':
                agg_data = grouped[value_column].sum().reset_index()
            elif aggregation == 'avg':
                agg_data = grouped[value_column].mean().reset_index()
            elif aggregation == 'count':
                agg_data = grouped[value_column].count().reset_index()
            elif aggregation == 'min':
                agg_data = grouped[value_column].min().reset_index()
            elif aggregation == 'max':
                agg_data = grouped[value_column].max().reset_index()
            else:
                agg_data = grouped[value_column].sum().reset_index()
            
            for _, row in agg_data.iterrows():
                date_str = int(row['year'])
                
                if date_str not in date_data_dict:
                    date_data_dict[date_str] = {'date': date_str}
                
                date_data_dict[date_str][value_column] = float(row[value_column]) if row[value_column] is not None else None
        
        result = [data for _, data in sorted(date_data_dict.items())]
        
        response = {
            'data': result,
            'columns': [col for col in value_columns if col in df.columns],
            'title': "Time Series"
        }
        
        return response


    def get_bar_chart_data(self, data):
        category_column = data['category_column']
        value_columns_str = data['value_columns']
        value_columns = [col.strip() for col in value_columns_str.split(',')]
        aggregation = data.get('aggregation', 'sum')
        top_n = data.get('top_n', 5)
        order = data.get('order', 'desc')
        
        df = self.df
        
        for col in value_columns:
            if col in df.columns:
                df[col] = df[col].apply(lambda x: None if pd.isna(x) else x)
        
        available_columns = [col for col in value_columns if col in df.columns]
        
        result_by_category = {}
        
        # df = df.reset_index()
        for value_column in available_columns:
            grouped = df.groupby(category_column)
            
            if aggregation == 'sum':
                agg_data = grouped[value_column].sum().reset_index()
            elif aggregation == 'avg':
                agg_data = grouped[value_column].mean().reset_index()
            elif aggregation == 'count':
                agg_data = grouped[value_column].count().to_frame(name=value_column).reset_index()
            elif aggregation == 'min':
                agg_data = grouped[value_column].min().reset_index()
            elif aggregation == 'max':
                agg_data = grouped[value_column].max().reset_index()
            else:
                agg_data = grouped[value_column].sum().reset_index()
            
            for _, row in agg_data.iterrows():
                cat = str(row[category_column])
                if cat not in result_by_category:
                    result_by_category[cat] = {'category': cat}
                
                result_by_category[cat][value_column] = float(row[value_column]) if row[value_column] is not None else None

        result_list = list(result_by_category.values())
        
        sorting_column = available_columns[0] if available_columns else None
        
        if sorting_column:
            result_list.sort(
                key=lambda x: x.get(sorting_column, 0) if x.get(sorting_column) is not None else 0, 
                reverse=(order != 'asc')
            )
            
        if top_n:
            result_list = result_list[:int(top_n)]
        
        response = {
            'data': result_list,
            'columns': available_columns,
            'title': "Bar Chart"
        }
        
        return response

    def get_grouped_bar_chart_data(self, data):
        category_column = data['category_column']
        group_column = data['group_column']
        value_columns_str = data['value_columns']
        value_columns = [col.strip() for col in value_columns_str.split(',')]
        aggregation = "sum" #data['aggregation']
        top_n = data.get('top_n', 5)
        compare_mode = data.get('compare_mode', 'source')
        
        
        df = self.df
        
        for col in value_columns:
            if col in df.columns:
                df[col] = df[col].apply(lambda x: None if pd.isna(x) else x)
        
        available_columns = [col for col in value_columns if col in df.columns]
        
        if compare_mode == 'source':
            primary_value_column = available_columns[0] if available_columns else None
            
            if not primary_value_column:
                return jsonify({"error": "No valid value column found"}), 400
                
            source_groups = []
            for col in available_columns:
                if "_src" in col:
                    source = col.split("_src")[1] if len(col.split("_src")) > 1 else None
                    if source:
                        source_groups.append(f"src{source}")
            
            grouped = df.groupby(category_column)
            
            result_by_category = {}
            
            for i, value_column in enumerate(available_columns):
                source = source_groups[i] if i < len(source_groups) else f"source_{i}"
                
                if aggregation == 'sum':
                    agg_data = grouped[value_column].sum().reset_index()
                elif aggregation == 'avg':
                    agg_data = grouped[value_column].mean().reset_index()
                elif aggregation == 'count':
                    agg_data = grouped[value_column].count().reset_index()
                elif aggregation == 'min':
                    agg_data = grouped[value_column].min().reset_index()
                elif aggregation == 'max':
                    agg_data = grouped[value_column].max().reset_index()
                else:
                    agg_data = grouped[value_column].sum().reset_index()
                
                for _, row in agg_data.iterrows():
                    cat = str(row[category_column])
                    if cat not in result_by_category:
                        result_by_category[cat] = {'category': cat}
                    
                    result_by_category[cat][source] = float(row[value_column]) if row[value_column] is not None else None
            
            result_list = list(result_by_category.values())
            
            if top_n:
                result_list.sort(
                    key=lambda x: sum(v for k, v in x.items() if k != 'category' and v is not None),
                    reverse=True
                )
                result_list = result_list[:int(top_n)]
            
            return {
                'data': result_list,
                'groups': source_groups
            }
        else:
            primary_value_column = available_columns[0] if available_columns else None
            
            if not primary_value_column:
                return jsonify({"error": "No valid value column found"}), 400
            
            grouped = df.groupby([category_column, group_column])
            
            if aggregation == 'sum':
                agg_data = grouped[primary_value_column].sum().reset_index()
            elif aggregation == 'avg':
                agg_data = grouped[primary_value_column].mean().reset_index()
            elif aggregation == 'count':
                agg_data = grouped[primary_value_column].count().reset_index()
            elif aggregation == 'min':
                agg_data = grouped[primary_value_column].min().reset_index()
            elif aggregation == 'max':
                agg_data = grouped[primary_value_column].max().reset_index()
            else:
                agg_data = grouped[primary_value_column].sum().reset_index()
            
            if top_n:
                cat_totals = agg_data.groupby(category_column)[primary_value_column].sum().reset_index()
                cat_totals = cat_totals.sort_values(by=primary_value_column, ascending=False)
                top_categories = cat_totals.head(int(top_n))[category_column].tolist()
                agg_data = agg_data[agg_data[category_column].isin(top_categories)]
            
            groups = sorted(agg_data[group_column].unique())
            
            result = []
            for category in sorted(agg_data[category_column].unique()):
                cat_data = {'category': str(category)}
                
                for group in groups:
                    filtered = agg_data[(agg_data[category_column] == category) & 
                                        (agg_data[group_column] == group)]
                    if not filtered.empty:
                        cat_data[str(group)] = float(filtered.iloc[0][primary_value_column]) if filtered.iloc[0][primary_value_column] is not None else None
                    else:
                        cat_data[str(group)] = None
                        
                result.append(cat_data)
            
            return {
                'data': result,
                'groups': [str(g) for g in groups]
            }
    
    def get_data(self):
        results = MergedData.query.filter_by(task_id=self.task_id).all()
        processed_data = []
        for row in results:
            data_dict = row.row_value
            data_dict['id'] = row.data_id
            processed_data.append(data_dict)
        
        self.df = pd.DataFrame(processed_data)

    def get_chart_recommendation(self):
        recommendations = ChartRecommendations.query.filter_by(task_id=self.task_id).first()
        return recommendations.recommendation
    
    def update_chart(self, graph_id, given_filters):
        try:
            res = {}
            dp = DataProcessor()
            for chart in self.charts:
                if chart["id"] == graph_id:
                    if chart["chart_type"] == "time_series":
                        res = self.get_time_series_data(chart["parameters"])
                        res["filters"] = {}
                        res["filters"]["time_series"] = dp.get_filters(self.df)
                        res["given_filters"] = given_filters
                        
                    if chart["chart_type"] == "bar_chart":
                        res = self.get_bar_chart_data(chart["parameters"])
                        res["filters"] = {}
                        res["filters"]["bar"] = dp.get_filters(self.df)
                        res["given_filters"] = given_filters
                        
                    if chart["chart_type"] == "grouped_bar":
                        res = self.get_bar_chart_data(chart["parameters"])
                        res["filters"] = {}
                        res["filters"]["grouped_bar"] = dp.get_filters(self.df)
                        res["given_filters"] = given_filters
                        
                    res["title"] = chart["description"]
                    res["id"] = chart["id"]
            
            return res
        except Exception as e:
            raise e
        
    def apply_filters(self, filters):
        for column in self.df.columns:
            if 'date' in column:
                self.df[column] = pd.to_datetime(self.df[column])
            if "id" in column.lower():
                self.df.drop(column, axis=1, inplace=True)
            if column in filters:
                if 'date' in column:
                    start_date, end_date = filters[column][0], filters[column][1]
                    self.df = self.df[(self.df[column] >= start_date) & (self.df[column] <= end_date)]
                elif not pd.api.types.is_numeric_dtype(self.df[column]):
                    if filters[column]: self.df = self.df[self.df[column].isin(filters[column])]
                else:
                    min_val, max_val = filters[column][0], filters[column][1]
                    self.df = self.df[(self.df[column] >= min_val) & (self.df[column] <= max_val)]
        
        self.df['saledate'] = self.df['saledate'].dt.strftime('%Y-%m-%d')

    def get_charts(self):
        try:
            charts = {"time_series": [], "bar": [], "grouped_bar": []}
            for chart in self.charts:
                if chart["chart_type"] == "time_series":
                    charts["time_series"].append(self.get_time_series_data(chart["parameters"]))
                    charts["time_series"][-1]["title"] = chart["description"]
                    charts["time_series"][-1]["id"] = chart["id"]
                    if "filters" not in chart:
                        dp = DataProcessor()
                        charts["time_series"][-1]["filters"] = {}
                        charts["time_series"][-1]["filters"]["time_series"] = dp.get_filters(self.df)
                    charts["time_series"][-1]["given_filters"] = []
                if chart["chart_type"] == "bar_chart":
                    charts["bar"].append(self.get_bar_chart_data(chart["parameters"]))
                    charts["bar"][-1]["title"] = chart["description"]
                    charts["bar"][-1]["id"] = chart["id"]
                    if "filters" not in chart:
                        dp = DataProcessor()
                        charts["bar"][-1]["filters"] = {}
                        charts["bar"][-1]["filters"]["bar"] = dp.get_filters(self.df)
                    charts["bar"][-1]["given_filters"] = []
                if chart["chart_type"] == "grouped_bar":
                    charts["grouped_bar"].append(self.get_grouped_bar_chart_data(chart["parameters"]))
                    charts["grouped_bar"][-1]["title"] = chart["description"]
                    charts["grouped_bar"][-1]["id"] = chart["id"]
                    if "filters" not in chart:
                        dp = DataProcessor()
                        charts["grouped_bar"][-1]["filters"] = {}
                        charts["grouped_bar"][-1]["filters"]["grouped_bar"] = dp.get_filters(self.df)
                    charts["grouped_bar"][-1]["given_filters"] = []
            
            return charts
        except Exception as e:
            raise e


