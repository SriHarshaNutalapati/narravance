import os
from DataLoader import DataLoader
from appsetup import db
from Models import DataSources


class FileProcessor:
    def __init__(self, data_folder=None):
        self.root_folder = os.path.join(os.getcwd(), "data")
        if data_folder:
            self.data_folder = os.path.join(os.getcwd(), "data", data_folder)
    
    def get_folders(self):
        return os.listdir(self.root_folder)
    
    def get_files(self):
        return os.listdir(self.data_folder)
    
    def create_folder(self, folder_name):
        try:
            os.makedirs(os.path.join(self.root_folder, folder_name))
        except Exception as e:
            raise Exception(f"Unable to create folder. Folder '{folder_name}' might already be present.")
        
    def upload_file(self, folder, file, file_name, file_description):
        try:
            if not file or not folder or not file_name:
                raise ValueError('Missing required fields')
            
            original_filename = file.filename
            file_ext = original_filename.rsplit('.', 1)[1].lower() if '.' in original_filename else ''
            
            if file_ext not in ['csv', 'json']:
                return ValueError('Only CSV and JSON files are allowed')
            
            file_path = os.path.join(self.data_folder, file.filename)
            file.save(file_path)
            
            data_loader = DataLoader(folder)
            file_df = data_loader.load_data(file.filename)
            columns = list(file_df.columns)

            new_file = DataSources(
                source_name=file_name,
                source_description=file_description,
                source_parent=folder,
                file_name=file.filename
            )
            
            db.session.add(new_file)
            db.session.commit()
            
            return {
                "message": "File uploaded successfully",
                "columns": columns,
                "source_id": new_file.source_id
            }
        except ValueError as e:
            raise e
        except Exception as e:
            db.session.rollback()
            raise e
    
    def save_file_metadata(self, source_id, metadata):
        try:
            if not source_id or not source_id:
                raise Exception("Missing required fields")
            
            file = DataSources.query.get(source_id)
            if not file:
                raise Exception("File not found")

            file.source_metadata = metadata
            db.session.commit()
            
            return {
                "message": "Metadata saved successfully",
                "source_id": source_id
            }
        except Exception as e:
            db.session.rollback()
            raise Exception(f'An error occurred: {str(e)}')
    

