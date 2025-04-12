import random, string
from datetime import datetime
from appsetup import db, TaskStatus



class Task(db.Model):
    __tablename__ = 'task'
    task_id = db.Column(db.String(8), primary_key=True, default=lambda: ''.join(random.choices(string.ascii_letters + string.digits, k=8)))
    name = db.Column(db.String(100), nullable=False)
    # description = db.Column(db.String(200), nullable=True)
    status = db.Column(db.Enum(TaskStatus), nullable=False, default=TaskStatus.CREATED)
    srcA = db.Column(db.String(200), nullable=False)
    srcB = db.Column(db.String(200), nullable=False)
    # data_folder = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    filters = db.Column(db.JSON, nullable=True)

    def __init__(self, name, srcA, srcB, status=TaskStatus.CREATED, filters=None):
        self.name = name
        self.status = status
        self.srcA = srcA
        self.srcB = srcB
        self.filters = filters


    def __repr__(self):
        return f"Task {self.task_name}: {self.task_id}"
    

class MergedData(db.Model):
    __tablename__ = 'mergeddata'
    data_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    task_id = db.Column(db.Integer, db.ForeignKey('task.task_id'), nullable=False)
    df1_name = db.Column(db.String(200), nullable=False)
    df2_name = db.Column(db.String(200), nullable=False)
    row_value = db.Column(db.JSON, nullable=False)

    task = db.relationship('Task', 
                          backref=db.backref('data_rows', 
                                            lazy=True, 
                                            cascade='all, delete-orphan'))


class DataSources(db.Model):
    __tablename__ = 'datasource'
    source_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    source_name = db.Column(db.String(200), nullable=False)
    source_description = db.Column(db.String(200), nullable=False)
    source_parent = db.Column(db.String(200), nullable=False)
    file_name = db.Column(db.String(200), nullable=False, unique=True)
    source_metadata = db.Column(db.JSON, nullable=True)

    def __repr__(self):
        return f"Source {self.source_name}: {self.source_description}"
    

class ChartRecommendations(db.Model):
    __tablename__ = 'chartrecommendations'
    recommendation_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    task_id = db.Column(db.Integer, db.ForeignKey('task.task_id'), nullable=False)
    recommendation = db.Column(db.JSON, nullable=False)


    task = db.relationship('Task', 
                          backref=db.backref('chartrecommendations', 
                                            lazy=True, 
                                            cascade='all, delete-orphan'))

