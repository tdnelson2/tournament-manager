# Tournament Manager
This is an app for managing all aspects of a tournament – player managerment, round generation, match play, winner identification. This iteration uses the non-elimination, [Swiss-system](https://en.wikipedia.org/wiki/Swiss-system_tournament) but it could easily be updated for simpler, elimination tournament schemas. Please feel free to contribute.

## Installation
* This is for local installation via a virtual Linux server configuration. If this seems like too much work, you can always play with the live web version [here](http://timothynelson.me/tournament-manager/).

### VM Setup
* Install [VirtualBox](https://www.virtualbox.org/wiki/Downloads).
* Install [Vagrant](https://www.vagrantup.com/downloads.html).
* Clone this project onto your machine.
* Inside the project folder, create a Linux environment: `vagrant up`.
* Wait for installationt to complete.

### Code Setup
* Go to your project folder and create a file named `my_path_data.py` containing these two lines of code:
```
root_url = '/tournament-manager'
html_index_root = '/'
```
* NOTE: If you're deploying to an actual server, you may need to change these paths depending on how you setup `000-default.conf`. I just did it this way so I could run it both locally and on a web server. Depending on which scenerio, none of the actual code needs to be changed - only the two lines in `my_path_data.py`.

### Dependencies
* Within the project directory, login to the Linux environment: `vagrant ssh`.
* Update: `sudo apt-get update`, `sudo apt-get upgrade`.
* Add software:
```
sudo apt-get install apache2
sudo apt-get install libapache2-mod-wsgi
sudo apt-get install postgresql
sudo apt-get -qqy install python python-pip
sudo pip2 install --upgrade pip
sudo pip2 install flask packaging oauth2client redis passlib flask-httpauth
sudo pip2 install sqlalchemy flask-sqlalchemy psycopg2 bleach requests
```

## OAuth
* Create a directory for OAuth secrets:
`sudo mkdir /var/www/tournament-manager-secrets`

### Google
* Go to the [Google API page](https://console.developers.google.com/apis/) and create a new project named `tournament-manager`.
* Make sure the project is selected, then go to `Credentials`, `Create credentials`, `OAuth Client ID`.
* On the resulting screen click `Configure consent screen` and under `Product name` put `Tournament Manager` and save
* On the next screen select `Web application`.
* Under `Authorized JavaScript origins` put `http://localhost:5000`.
* Under `Authorized redirect URIs` put `http://localhost:5000` and `http://localhost:5000/login`.
* Click `Create`, `OK`, then click the download icon on the right side of the screen under `Web client 1`.
* Open it in a text editor, copy the contents, login to your Linux environment (`vagrant ssh`), `sudo nano /var/www/tournament-manager-secrets/client_secret.json`, paste and save (`ctr-o`, `ctr-x`).

### Facebook
* Go to the [Facebook app API page](https://developers.facebook.com/apps), click `Add a New App`, name it `tournament-manager` and click `Create App ID`.
* Under `Settings`, `Basic` click `Add Platform` then select `Website`.
* Under `Site URL` put `http://localhost:5000`.
* Leave the Facebook app settings page open, login to your Linux environment (`vagrant ssh`), `sudo nano /var/www/tournament-manager-secrets/fb_client_secrets.json`, paste the following code into it:
```
{
  "web": {
    "app_id": "YOUR_APP_ID_HERE",
    "app_secret": "YOUR_CLIENT_SECRET_HERE"
  }
}
```
* Back at the Facebook app settings page, use the `App ID` and `App Secret` to fill in the above code.

## Database Setup
* `cd` to you project folder and launch your Linux environment: `vagrant ssh`.
* Go to the vagrant shared folder: `cd /vagrant`.
* Open PostgreSQL: `sudo -u postgres psql`.
* Create the database: `\i tournament.sql`.
* Give the `postgres` user a password: `\password postgres` and use 'password' for the password (This is important since the project is setup for this username/password combo).
* Exit: `\q`.

## Use
* In your Linux environment, launch the python server: `sudo /vagrant/python myapp.py`.
* App should be live at `http://localhost:5000/tournament-manager`.
* You'll be redirected to a login page, the Google and Facebook options store tournament data in the PostgreSQL database while Guest Mode login simply puts the data in `localStorage`.
