import os
import pandas as pd

class DataLoader:
    def __init__(self):
        self.data_folder = os.path.join(os.getcwd())

    def load_data(self, filename):
        try:
            file_path = os.path.join(self.data_folder, filename)
            if filename.endswith(".csv"):
                return pd.read_csv(file_path)
            elif filename.endswith(".json"):
                return pd.read_json(file_path)
            else:
                raise ValueError(f"Unsupported file type: {filename}")
        except FileNotFoundError:
            print(f"Error: File '{filename}' not found in {self.data_folder}")
        except Exception as e:
            print(f"Error loading data '{filename}': {e}")
        return None