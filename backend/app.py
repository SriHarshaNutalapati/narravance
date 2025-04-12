import os
from flask import Flask
from routes import dataapis
from flask_cors import CORS
from sqlalchemy import create_engine, inspect
from Models import db
from appsetup import AppSetup, db
import signal
import sys


app = Flask(__name__)

CORS(app)


app.register_blueprint(dataapis)

db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'narravance.db'))

app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app_setup = AppSetup()
app_setup.init_app(app)

def handle_exit_signal(signum, frame):
    print("\nReceived termination signal. Stopping Flask and workers...")
    AppSetup().task_processor.shutdown()
    sys.exit(0)



def check_and_create_table():
    engine = create_engine(app.config['SQLALCHEMY_DATABASE_URI'])
    inspector = inspect(engine)
    
    if 'task' not in inspector.get_table_names() or 'mergeddata' not in inspector.get_table_names() or 'datasource' not in inspector.get_table_names() \
    or 'chartrecommendations' not in inspector.get_table_names():
        print("Creating the db tables...")
        with app.app_context():
            db.create_all()
    else:
        print("Table 'task' already exists.")

if __name__ == '__main__':
    check_and_create_table()
    AppSetup().task_processor.start_processing()
    app.run(debug=False, threaded=True)



