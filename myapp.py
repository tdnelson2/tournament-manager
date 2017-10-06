from flask import Flask, render_template, request

import psycopg2
import json
import tournament

from my_path_data import root_url
from my_path_data import html_index_root


app = Flask(__name__)
app.secret_key = 'super_secret_key'

@app.route(root_url+'/', methods=['GET', 'POST'])
def index():
    """Serve the client-side application."""
    return render_template('index.html')

@app.context_processor
def utility_processor():
    """
    Make several useful functions directly
    accesible by jinja2. That way we can call
    them directly from within each template
    and avoid cluttering up the view functions.
    """
    def links_root():
    	return html_index_root

    return dict(links_root=links_root)

if __name__ == '__main__':
    app.debug = True
    app.run(host='0.0.0.0', port=5000)