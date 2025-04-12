import pandas as pd
from enum import Enum


class ColumnTypes(Enum):
    DATE = "date"
    CATEGORY = "category"
    NUMERICAL = "numerical"


class DataProcessor:
    def __init__(self, data_loader=None):
        self.data_loader = data_loader

    def get_column_type(self, df, column):
        try:
            if "date" in column.lower():
                return ColumnTypes.DATE.value
            if not pd.api.types.is_numeric_dtype(df[column]):
                return ColumnTypes.CATEGORY.value
            return ColumnTypes.NUMERICAL.value
        except Exception as e:
            print(f"Error determining column type for '{column}': {e}")
            return None

    def get_filters(self, df):
        filters = {}
        try:
            for column in df.columns:
                if "id" in column: continue
                column_type = self.get_column_type(df, column)
                if not column_type:
                    continue
                filter_info = {"type": column_type}
                if column_type == ColumnTypes.DATE.value:
                    filter_info["from"] = df[column].min()
                    filter_info["to"] = df[column].max()
                    if isinstance(filter_info["from"], pd.Timestamp):
                        filter_info["from"] = filter_info["from"].strftime('%Y-%m-%d')
                    if isinstance(filter_info["to"], pd.Timestamp):
                        filter_info["to"] = filter_info["to"].strftime('%Y-%m-%d')
                elif column_type == ColumnTypes.CATEGORY.value:
                    filter_info["values"] = [{"value": value, "label": value} for value in list(df[column].unique())]
                else:
                    filter_info["min"] = int(df[column].min())
                    filter_info["max"] = int(df[column].max())

                filters[column] = filter_info
            return filters
        except Exception as e:
            print(f"Error generating filters: {e}")
            return []

    def process_data(self, srcA, srcB):
        try:
            srcA_df = self.data_loader.load_data(srcA)
            srcB_df = self.data_loader.load_data(srcB)

            if srcA_df is None or srcB_df is None:
                return {}
            
            return {
                srcA: self.get_filters(srcA_df),
                srcB: self.get_filters(srcB_df),
            }
        except Exception as e:
            print(f"Error processing data: {e}")
            return {}