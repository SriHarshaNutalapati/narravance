from flask import Flask, request, jsonify
from openai import OpenAI
import os
import json
from Models import DataSources
import random, string

app = Flask(__name__)

client = OpenAI(api_key = "")


class OpenAIAgent:
    def __init__(self, data):
        # self.srcA = data["srcA"]
        # self.srcB = data["srcB"]
        # self.dataSrcDescription = ""
        # self.srcA_meta = self.getMetaData(self.srcA, "A")
        # self.srcB_meta = self.getMetaData(self.srcB, "B")
        # self.cols_prompt = ""
        # self.construct_prompt_params()
        self.prompt_responses = []
        self.prompt_data = {}
    
    def prompt(self):
        return (
            f"""I have two dataframes named srcA and srcB. Below is the description of the dataframes:
            srcA description - Sales of the vehicles in New York City
            srcB description - Sales of the vehicles in Dallas City
            I merged the dataframes srcA and srcB on the common date column named saledate. The merged df has the following 11 columns:
            1. saledate: The date on which the vehicle is sold. It is a date column
            2. vehicletype_srcA - The type of the vehicle sold in New York City on the saledate. It is a category column. Its values are Impreza, Camry, CRV, Legacy, Elantra, Mazda3, Rogue, Impala, Focus, Malibu, Jetta, Passat, Accord, Sentra, Optima, Corolla, Sonata, Altima, Tiguan, Mazda6, Tucson, Escape, Civic, Outback, Fusion, Equinox, Sportage, Forte, RAV4, CX-5.
            3. manufacturer_srcA - The manufacturer of the vehicle sold in New York City on the saledate. It is a category column. Its values are Subaru, Toyota, Honda, Hyundai, Mazda, Nissan, Chevrolet, Ford, Volkswagen, Kia.
            4. price_srcA - The price of the vehicle sold in the New York City on the saledate. It is a numeric column. 
            5. saletype_srcA - It represents if the vehicle sold in the New York City on the saledate is new or used. It is a category column. Its values are new, used.
            6. customerarea_srcA - It is the area of the customer who purchased the vehicle on the saledate. It is a category column. Its values are StatenIsland, Manhattan, SoHo, UpperEast, Chinatown, Astoria, Flushing, UpperWest, Queens, Harlem, Brooklyn, Downtown, Midtown, Williamsburg, Bronx, LittleItaly, TimesSquare, Financial, Tribeca, Chelsea.
            7. vehicletype_srcB - The type of the vehicle sold in Dallas City on the saledate. It is a category column. Its values are Tucson, Equinox, Camry, Fusion, Corolla, Impreza, CX-5, Impala, Mazda3, RAV4, Tiguan, Civic, Rogue, Jetta, Mazda6, Malibu, Sonata, Sentra, Sportage, CRV, Focus, Accord, Outback, Altima, Optima, Escape, Elantra, Passat, Forte, Legacy.
            8. manufacturer_srcB - The manufacturer of the vehicle sold in Dallas City on the saledate. It is a category column. Its values are Hyundai, Chevrolet, Toyota, Ford, Subaru, Mazda, Volkswagen, Honda, Nissan, Kia.
            9. price_srcB - The price of the vehicle sold in the Dallas City on the saledate. It is a numeric column.
            10. saletype_srcB - It represents if the vehicle sold in the Dallas City on the saledate is new or used. It is a category column. Its values are new, used.
            11. customerarea_srcB - It is the area of the customer who purchased the vehicle on the saledate. It is a category column. Its values are Dallas Downtown, Richardson, Irving, Frisco, Plano, Preston.
            
            Remember the following points:
            1. Each column ends with _srcA or _srcB. This represents if the column belongs to srcA or srcB. 
            2. Only the date column does not end with either _srcA or _srcB.
            2. For each column, the description of the column is given after the hyphen.
            3. For each column, the column type is specified as either numeric, category or date. 
            Prompt:
            Given the column description of the merged dataframes, can you give me atleast 5 suggestions on what graphs could be generated using the merged dataframe? I can only do time series and bar charts. 
            For time series chart, I can only perform aggregation. 
            For bar chart and grouped bar chart, I can only perform groupby and aggregation. In aggregation, I can only perform sum, avg, count. 
            When generating chart suggestions, give the priority to date columns followed by numeric and then categorical. 
            When generating time series chart, use date and numeric columns. When generating bar graphs, use category columns.
            The time series and grouped bar chart must use both the dataframes. The bar chart can use either both the dataframes or a single dataframe.
            I have three functions to generate the charts. 
            1) To generate time series data, the function accepts the following parameters:
    
                Query Parameters:
                - date_column: The column to use for the date axis
                - value_columns: Comma-separated list of columns to compare
                - aggregation: The aggregation function to use (sum, avg, count, min, max)
                Returns JSON with formatted time series data suitable for charts.

            2) To generate bar graph data, the function accepts the following parameters:
    
                Query Parameters:
                - category_column: The column to use for categories
                - value_columns: Comma-separated list of columns to compare. It must be a numeric column.
                - aggregation: The aggregation function to use (sum, avg, count, min, max)
                - top_n: Optional limit for the number of bars
                - order: Optional ordering
                
                Returns JSON with formatted bar chart data. 
            
            3) To generate grouped bar chart, the function accepts the following parameters:

                Query Parameters:
                - category_column: The primary column for categories
                - group_column: The column to group bars by
                - value_columns: Comma-separated list of columns to compare. It must be a numeric column.
                - aggregation: The aggregation function to use 
                - top_n: Optional limit for the number of categories 
                - compare_mode: How to compare columns: 'group' (default) or 'source'
                
                Returns JSON with formatted grouped bar chart data.
            
            Now that you know the inputs to the function, give me the chart suggestions so that I can plug in the values directly to the functions
            Give me the suggestions in a JSON format. Please follow the below JSON format strictly in the answer:
            {'{'}
                'chart_type': 'time_series' or 'bar_chart' or 'grouped_bar',
                'description': 'Time series chart showing the total sales price over time for both dataframes.',
                'parameters': {'{'}
                    'aggregation': '',
                    'date_column': '',
                    'group_by': '',
                    'value_columns': ''
                {'}'}
                'df_used': 'srcA' or 'srcB' or 'srcA, srcB'
            {'}'}
            
            For each chart suggestion, mention the df used in the df_used key. Mention if it uses srcA only, srcB only or both srcA and srcB. The value of 'df_used' by be 'srcA' or 'srcB' or 'srcA, srcB'.
            
            """
        )
    

    def chat(self):
        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are responsible for generating suggestions on what kind of analysis charts could be made based on the given prompt."},
                    {"role": "user", "content": self.prompt()}
                ],
                temperature=0.2,
                max_tokens=800, 
                stop=None, 
                top_p=1.0
            )
            
            resp = response.choices[0].message.content
            resp = resp.strip('```json\n').rstrip('```')
            resp = json.loads(resp)
            for chart in resp:
                chart["id"] = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
            self.prompt_responses.append(resp)
            return resp

        except Exception as e:
            raise e
        
    def getMetaData(self, src, suffix):
        try:
            data_src = DataSources.query.filter_by(file_name=src).first()
            self.dataSrcDescription += "src" + suffix + " description: " + data_src.source_description + " \n"
            return data_src.source_metadata
        except Exception as e:
            raise e

    def construct_prompt_params(self):
        try:
            srcB_cols = [col["name"] for col in self.srcB_meta if "id" not in col["name"]]
            common_cols = []
            for col in self.srcA_meta:
                if col["name"] in srcB_cols:
                    common_cols.append(col["name"])
                    col_name = col["name"] if "date" in col["name"] else col["name"] + "_srcA"
                    self.cols_prompt += col_name + ": " + col["description"] + ". It is a " + col['type'] + " column. " + "\n"
            for col in self.srcB_meta:
                if col["name"] in common_cols and "date" not in col["name"]:
                    col_name = col["name"] + "_srcB"
                    self.cols_prompt += col_name + ": " + col["description"] + ". It is a " + col['type'] + " column. " + "\n"
        except Exception as e:
            raise e