from flask_sqlalchemy import SQLAlchemy
from enum import Enum

db = SQLAlchemy()

class TaskStatus(Enum):
    CREATED = "CREATED"
    INPROGRESS = "INPROGRESS"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class AppSetup:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(AppSetup, cls).__new__(cls)
            cls._instance._taskProcessor = None
            cls._instance._db = None
        return cls._instance

    def init_app(self, app):
        db.init_app(app)
        if self._taskProcessor is None:
            from TasksProcessor import TasksProcessor
            self._taskProcessor = TasksProcessor(db)

    @property
    def task_processor(self):
        return self._taskProcessor
