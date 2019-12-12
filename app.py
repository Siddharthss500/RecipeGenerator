from flask import (Flask, session, render_template, request, send_file)

from model import extend

from flask_session import Session

app = Flask(__name__, static_url_path='')


SESSION_TYPE = 'filesystem'
app.config.from_object('config.default')

# Basic setting
app.secret_key = "recipe_generation"
app.config['SESSION_TYPE'] = SESSION_TYPE

Session(app)

@app.route('/static/data/<path:path>')
def return_file_contents(path):
    return open("static/data/" + path, 'r').read()


# @app.route('/')
# def hello_world():
#     return render_template('dataset.html')

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'GET':
        return render_template('dataset.html')
    data = request.form.get('q')
    print(data)
    return extend(data)

if __name__ == '__main__':
    # application.run(port=8081, host='0.0.0.0', debug=application.config['DEBUG'])
    app.run(debug=app.config['DEBUG'])