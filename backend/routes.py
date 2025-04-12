from flask import Blueprint, jsonify, request, current_app
import os
from DataProcessor import DataProcessor
from DataLoader import DataLoader
from appsetup import AppSetup
from OpenAiAgent import OpenAIAgent
from AnalyticsGenerator import AnalyticsGenerator
from FileProcessor import FileProcessor

from werkzeug.exceptions import NotFound, InternalServerError


dataapis = Blueprint('api', __name__)

@dataapis.route('/api/getfiles', methods=['GET'])
def get_data_folders():
    folder = request.args.get("folder")
    file_processor = FileProcessor(folder)
    return jsonify({"files": file_processor.get_files()}), 200


@dataapis.route('/api/gettasks', methods=['GET'])
def get_tasks():
    try:
        tasks =  AppSetup().task_processor.get_tasks()
        return jsonify(tasks), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@dataapis.route('/api/getfilters', methods=['POST'])
def get_filters():
    data = request.get_json()
    data_loader = DataLoader()
    data_processor = DataProcessor(data_loader)
    return jsonify(data_processor.process_data(data["srcA"], data["srcB"]))

@dataapis.route('/api/chartsuggestions', methods=['POST'])
def get_chart_suggestions():
    data = request.get_json()
    aiagent = OpenAIAgent(data)
    resp = aiagent.chat()
    return jsonify(resp)

@dataapis.route('/api/createtask', methods=['POST'])
def create_task():
    data = request.get_json()
    task_data = AppSetup().task_processor.create_task(data)
    return jsonify(task_data), 201


@dataapis.route('/api/starttask', methods=['POST'])
def start_task():
    data = request.get_json()
    chartrecommendations = data["chartrecommendations"]
    task_id = data["task_id"]
    AppSetup().task_processor.save_chart_recommendations(task_id, chartrecommendations)
    AppSetup().task_processor.start_task(data["task_id"])
    return jsonify({"success": "Task Started Successfully"}), 200

@dataapis.route('/api/generatecharts', methods=['POST'])
def generate_charts():
    try:
        data = request.get_json()
        analytics_gen = AnalyticsGenerator(data)
        return jsonify(analytics_gen.get_charts()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@dataapis.route('/api/getfolders', methods=['GET'])
def get_folders():
    try:
        file_processor = FileProcessor()
        return jsonify({"folders": file_processor.get_folders()}), 200
    except Exception as e:
        return jsonify(error="Unable to get folders. Please try again."), 500
    
@dataapis.route('/api/createfolder', methods=['POST'])
def create_folder():
    try:
        data = request.get_json()
        file_processor = FileProcessor()
        file_processor.create_folder(data["folder_name"])
        return jsonify({"message": f"Folder {data["folder_name"]} is created!"}), 201
    except Exception as e:
        return jsonify(error=str(e)), 500
    
@dataapis.route('/api/upload', methods=['POST'])
def upload_file():
    try:
        file = request.files.get('file')
        folder = request.form.get('folder')
        file_name = request.form.get('fileName')
        description = request.form.get('description')
        file_processor = FileProcessor(folder)
        resp = file_processor.upload_file(folder, file, file_name, description)
        return jsonify(resp), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@dataapis.route('/api/savemetadata', methods=['POST'])
def save_metadata():
    try:
        data = request.get_json()
        source_id = data.get('source_id')
        metadata = data.get('metadata')
        file_processor = FileProcessor()
        return jsonify(file_processor.save_file_metadata(source_id, metadata)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
@dataapis.route('/api/deletetask', methods=['POST'])
def delete_task():
    try:
        data = request.get_json()
        task_id = data.get('task_id')
        AppSetup().task_processor.delete_task(task_id)
        return jsonify({"message": "Tasks successfully deleted."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
@dataapis.route('/api/applygraphfilter', methods=['POST'])
def apply_graph_filter():
    try:
        data = request.get_json()
        graph_id = data.get('graph_id')
        given_filters = data.get("filters")
        ag = AnalyticsGenerator(data)
        ag.apply_filters(given_filters)
        updated_graph = ag.update_chart(graph_id, given_filters)
        return jsonify({"updated_graph": updated_graph, "graph_id": graph_id}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
    
        