# Project for Full Stack Developer position at Narravance
# Name: Venkata Krishna Phani Sri Harsha Nutalapati
# Email: nsriharsha96@gmail.com

# Youtube link: https://www.youtube.com/watch?v=f-ouaJj1p4M

# Project setup:
Please follow the below steps for running the application in our local:
#### Setting up the backend
1. Download python >=3.9.
2. Go to a folder where you want to create the virtual environment for python. Create a python virtual environment using the command `python -m venv <enter the environment name>`.
3. Activate the environment using `.\<envname>\Scripts\activate` (for windows) or `source <envname>/bin/activate` for Linux and MacOS.
4. Now, go to the backend folder in the project and install the libraries for running the backend. To install the libraries, run the command `pip install -r requirements.txt`
5. Now, run the command `python app.py` and your backend will be up and running.

#### Setting up the frontend
1. Download node.js for your OS using the link https://nodejs.org/en/download. 
2. Go to the frontend folder and install the required frontend packages for the project. Run the command `npm install` to install the packages.
3. Now, run the command `npm run dev` to start the frontend. Your front end server will be running at http://localhost:5173/


#### Setting up OpenAI Api Key
1. Open your browser and go to https://platform.openai.com/
2. Create an account and login.
3. Once logged in, visit: https://platform.openai.com/account/api-keys
4. Click on the “+ Create new secret key” button. Give it a name (optional, for your reference). Click Create secret key.
5. Important: The API key will be shown only once. Copy and save it securely.
6. In the project, go to the `openaiagent.py` file and paste the key in the line `client = OpenAI(api_key = "<paste the key here>")`

#### Optional:
1. To setup a budget on the API key, go to https://platform.openai.com/settings/organization/limits.
2. In the Usage Limits section, set the values for `Set Lower Threshold Alert` (If your organization exceeds this threshold in a given calendar month (UTC), an alert notification will be sent to this email.)
3. Now, set the value for `Set Higher Threshold Alert`. (If your organization exceeds this threshold in a given calendar month (UTC), an alert notification will be sent to this email.)
4. As a benchmark, I have made 83 requests and used 104K tokens which costed me $0.54.


# Technical Documentation
### Backend
1. The backend is developed using python, flask and flask-sqlalchemy.
2. During the application startip, two threads will be launched. These two threads are responsible for processing tasks. They are created in the start_processing() function of the TaskProcessor class.
3. The project has 3 database tables which are mentioned in Models.py file.
   - Task: This table stores all the tasks.
   - MergedData: This tables stores the data which is obtained after applying the filters to the data files. Each row in the filtered data is stored as an entry in this table. All the rows related to a task have the same task_id (which is the foreign key in this table). The relationship between MergedData table and Task table is Many to One.
   - ChartRecommendations: This table is responsible for storing the chart recommendations coming from open ai LLM. Each recommendation is associated with a task_id (which is the foreign key in this table). The relationship between MergedData table and Task table is One to One.
5. There are four main classes in the backend which are as follows:
   - TasksProcessor: This class is responsible for creating and processing tasks. The object of this class is created during the application startup and the instance is stored in AppSetp class. The instance variable task_queue acts as a queue. The main thread publishes the task_id to this queue. Any free sub thread will consume the task_id from the task queue. The function create_task creates the task and adds the entry to the database. 
   - DataProcessor: This class is responsible for loading the data from the files and converting them to dataframes. The function process_data is used to convert the input files to dataframes. The function apply_filters is used to apply the user selected filters to the dataframes.
   - AnalyticsGenerator: This class is responsible for generating visualizations for the task. The functions get_time_series_data, get_bar_chart_data, get_grouped_bar_chart_data are used to generate Time Series chart, Bar Chart and Grouped Bar Chart respectively.
   - OpenAIAgent: This class is used for prompting the open AI LLM. The function chat is responsible for interacting with the LLM and getting the response. 
6. Flow of the Creation of Task:
   - A request is made to /api/createtask with the taskname, filter details. This API creates the task in the DB.
   - The OpenAI LLM is then prompted using the endpoint /api/chartsuggestions. The generated charts are shown to the user at the frontend.
   - When user completes the selection of charts, a call is made to /api/starttask. This api will first save the charts selected by user to the DB in the ChartRecommendations table. The api then adds the task_id to the task_queue of the TaskProcessor class.
   - One of the two threads will consume the task_id and start the task. First, we get the task object from the DB using the task_id, then we load the input files and apply the user selected filters on the files, merge the files and store the merged data in the MergedData table.
   - The task creation is complete and user is navigated to the homepage.
7. Flow of opening the task and generating visualizations:
   - User opens a task upon clicking the task id in the home page. A request is sent to the /api/generatecharts which generates the charts based on the user selection.
   - The generated charts are then rendered to the frontend.
8. Flow of applying filters to the generated charts:
   - When user selects filters of a chart, a request is sent to the endpoint /api/applygraphfilter with the task_id, graph_id and the filters. The filters are applied to the graph and the graph is sent to the frontend. In the frontend, the applied filters are persisted for next stage of filtering.
  
### Frontend Documentation
1. The frontend is developed using react and react-bootstrap.
2. Below are the main components for the frontend:
   - TaskHome.jsx: It is the homepage of the application. Here all the tasks are shown in a tabular format.
   - Task.jsx: It is the page where we can see visualizations of a particular task. To reach here, we can click on a task id in the homepage.
   - CreateTask.jsx: It is responsible for the UI of creating the task. It is loaded when the New Task button is clicked on homepage.
   - Filters.jsx: It is the component that is responsible for generating the UI of filters. It is used both in creation of task page and also for applying additional filters during the visualization of a task.
  
   
