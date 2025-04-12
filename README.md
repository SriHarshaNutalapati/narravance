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
2. During the application startip, two threads will be launched. These two threads are responsible for processing tasks.
3. The project has 3 database tables which are mentioned in Models.py file.
   - Task: This table stores all the tasks.
   - MergedData: This tables stores the data which is obtained after applying the filters to the data files. Each row in the filtered data is stored as an entry in this table. All the rows related to a task have the same task_id (which is the foreign key in this table). The relationship between MergedData table and Task table is Many to One.
   - ChartRecommendations: This table is responsible for storing the chart recommendations coming from open ai LLM. Each recommendation is associated with a task_id (which is the foreign key in this table). The relationship between MergedData table and Task table is One to One.
5. There are three main classes in the backend which are as follows:
   - TasksProcessor: This class is responsible for creating and processing tasks. The instance variable task_queue acts as a queue. The main thread publishes the task_id to this queue. Any free sub thread will consume the task_id from the task queue. 
