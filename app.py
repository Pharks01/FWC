from flask import Flask, render_template, request, jsonify, redirect, url_for, flash, send_from_directory, session
from werkzeug.utils import secure_filename
from functools import wraps
import os
import json
import datetime
from pathlib import Path

app = Flask(__name__)
app.secret_key = 'forever_we_cleave_2026'

# Admin credentials (simple password protection)
ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD = 'forever2026'

# Configuration
UPLOAD_FOLDER = os.path.join(app.root_path, 'static', 'uploads')
DATA_FOLDER = os.path.join(app.root_path, 'data')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'avi', 'webm'}

# Ensure directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(os.path.join(UPLOAD_FOLDER, 'hero'), exist_ok=True)
os.makedirs(os.path.join(UPLOAD_FOLDER, 'proposal'), exist_ok=True)
os.makedirs(os.path.join(UPLOAD_FOLDER, 'gallery'), exist_ok=True)
os.makedirs(DATA_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def load_data():
    """Load wedding data from JSON file"""
    data_file = os.path.join(DATA_FOLDER, 'wedding_data.json')
    if os.path.exists(data_file):
        with open(data_file, 'r') as f:
            return json.load(f)
    return {
        'white_wedding': {
            'date': 'April 2026 (Date TBD)',
            'time': 'TBD',
            'venue': 'TBD',
            'address': 'Details to be announced',
            'location': 'Location TBD',
            'map_embed': '',
            'rsvp_link': '#'
        },
        'white_wedding_reception': {
            'date': 'April 2026 (Date TBD)',
            'time': 'TBD',
            'venue': 'TBD',
            'address': 'Details to be announced',
            'location': 'Location TBD',
            'map_embed': '',
            'rsvp_link': '#'
        },
        'rsvp_link': '#',
        'contact': {
            'whatsapp': '+234 907 410 1930',
            'email': 'foreverwecleave@gmail.com'
        }
    }

def save_data(data):
    """Save wedding data to JSON file"""
    data_file = os.path.join(DATA_FOLDER, 'wedding_data.json')
    with open(data_file, 'w') as f:
        json.dump(data, f, indent=2)

def get_media_files(folder):
    """Get list of media files in a folder with metadata"""
    folder_path = os.path.join(UPLOAD_FOLDER, folder)
    if not os.path.exists(folder_path):
        return []
    
    files = []
    for filename in sorted(os.listdir(folder_path)):
        if allowed_file(filename):
            filepath = os.path.join(folder_path, filename)
            if os.path.isfile(filepath):
                file_url = f'/static/uploads/{folder}/{filename}'
                file_type = 'video' if filename.lower().endswith(('.mp4', '.mov', '.avi', '.webm')) else 'image'
                
                # Get file info
                file_info = {
                    'url': file_url,
                    'type': file_type,
                    'name': filename,
                    'filepath': filepath
                }
                
                # For images, try to get dimensions
                if file_type == 'image':
                    try:
                        from PIL import Image
                        with Image.open(filepath) as img:
                            file_info['width'] = img.width
                            file_info['height'] = img.height
                            file_info['aspect_ratio'] = img.width / img.height
                            file_info['orientation'] = 'landscape' if img.width > img.height else 'portrait' if img.height > img.width else 'square'
                    except:
                        # Fallback if PIL is not available or image can't be read
                        file_info['orientation'] = 'landscape'
                else:
                    # For videos, default to landscape (can be updated when video loads)
                    file_info['orientation'] = 'landscape'
                
                files.append(file_info)
    return files

@app.route('/')
def index():
    # Calculate countdown for traditional wedding
    traditional_date = datetime.datetime(2026, 3, 7, 13, 0, 0)
    now = datetime.datetime.now()
    time_diff = traditional_date - now
    
    days = max(0, time_diff.days)
    hours = max(0, time_diff.seconds // 3600)
    minutes = max(0, (time_diff.seconds % 3600) // 60)
    seconds = max(0, time_diff.seconds % 60)
    
    countdown = {
        'days': days,
        'hours': hours,
        'minutes': minutes,
        'seconds': seconds
    }
    
    # Get media files for slideshows
    hero_media = get_media_files('hero')
    proposal_media = get_media_files('proposal')
    gallery_media = get_media_files('gallery')
    
    # Load dynamic data
    data = load_data()
    
    return render_template('index.html', 
                         countdown=countdown,
                         hero_media=hero_media,
                         proposal_media=proposal_media,
                         gallery_media=gallery_media,
                         data=data)

@app.route('/registry')
def registry():
    return render_template('registry.html')

@app.route('/asoebi')
def asoebi():
    return render_template('asoebi.html')

@app.route('/rsvp', methods=['GET', 'POST'])
def rsvp():
    data = load_data()
    
    if request.method == 'POST':
        # Handle RSVP form submission
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip()
        phone = request.form.get('phone', '').strip()
        attending = request.form.get('attending', '').strip()
        guests = request.form.get('guests', '0').strip()
        message = request.form.get('message', '').strip()
        
        # Create WhatsApp message
        whatsapp_message = f"""RSVP for Sodienye & Ayoade's Wedding

Name: {name}
Email: {email}
Phone: {phone}
Attending: {attending}
Number of Guests: {guests}

Message:
{message}

---
Sent from Forever We Cleave wedding website"""
        
        # URL encode the message
        import urllib.parse
        encoded_message = urllib.parse.quote(whatsapp_message)
        whatsapp_url = f"https://wa.me/2349074101930?text={encoded_message}"
        
        # Also create email subject and body
        email_subject = urllib.parse.quote(f"RSVP: {name} - Sodienye & Ayoade Wedding")
        email_body = urllib.parse.quote(f"""Dear Sodienye & Ayoade,

I/We would like to RSVP for your wedding.

Name: {name}
Email: {email}
Phone: {phone}
Attending: {attending}
Number of Guests: {guests}

Message:
{message}

Looking forward to celebrating with you!

Warm regards,
{name}""")
        email_url = f"mailto:foreverwecleave@gmail.com?subject={email_subject}&body={email_body}"
        
        return render_template('rsvp.html', 
                             data=data,
                             rsvp_link=data.get('rsvp_link', '#'),
                             whatsapp_url=whatsapp_url,
                             email_url=email_url,
                             submitted=True,
                             form_data={
                                 'name': name,
                                 'email': email,
                                 'phone': phone,
                                 'attending': attending,
                                 'guests': guests,
                                 'message': message
                             })
    
    return render_template('rsvp.html', data=data, rsvp_link=data.get('rsvp_link', '#'), submitted=False)

# Admin authentication decorator
def require_admin(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_logged_in' not in session:
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '').strip()
        
        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session['admin_logged_in'] = True
            return redirect(url_for('admin'))
        else:
            flash('Invalid username or password', 'error')
    
    return render_template('admin_login.html')

@app.route('/admin/logout')
def admin_logout():
    session.pop('admin_logged_in', None)
    return redirect(url_for('index'))

@app.route('/admin')
@require_admin
def admin():
    data = load_data()
    return render_template('admin.html', data=data)

@app.route('/admin/update', methods=['POST'])
@require_admin
def admin_update():
    data = load_data()
    
    # Update white wedding details
    data['white_wedding'] = {
        'date': request.form.get('white_wedding_date', 'April 2026 (Date TBD)'),
        'time': request.form.get('white_wedding_time', 'TBD'),
        'venue': request.form.get('white_wedding_venue', 'TBD'),
        'address': request.form.get('white_wedding_address', 'Details to be announced'),
        'location': request.form.get('white_wedding_location', 'Location TBD'),
        'map_embed': request.form.get('white_wedding_map', ''),
        'rsvp_link': request.form.get('white_wedding_rsvp_link', '#')
    }
    
    # Update white wedding reception details
    data['white_wedding_reception'] = {
        'date': request.form.get('reception_date', 'April 2026 (Date TBD)'),
        'time': request.form.get('reception_time', 'TBD'),
        'venue': request.form.get('reception_venue', 'TBD'),
        'address': request.form.get('reception_address', 'Details to be announced'),
        'location': request.form.get('reception_location', 'Location TBD'),
        'map_embed': request.form.get('reception_map', ''),
        'rsvp_link': request.form.get('reception_rsvp_link', '#')
    }
    
    # Update contact info
    data['contact'] = {
        'whatsapp': request.form.get('whatsapp', '+234 907 410 1930'),
        'email': request.form.get('email', 'foreverwecleave@gmail.com')
    }
    
    # Update RSVP link
    data['rsvp_link'] = request.form.get('rsvp_link', '#')
    
    save_data(data)
    flash('Settings updated successfully!', 'success')
    return redirect(url_for('admin'))

@app.route('/admin/upload/<folder>', methods=['POST'])
def upload_media(folder):
    if 'files' not in request.files:
        return jsonify({'error': 'No files provided'}), 400
    
    files = request.files.getlist('files')
    uploaded = []
    
    for file in files:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            folder_path = os.path.join(UPLOAD_FOLDER, folder)
            os.makedirs(folder_path, exist_ok=True)
            
            filepath = os.path.join(folder_path, filename)
            file.save(filepath)
            
            file_url = f'/static/uploads/{folder}/{filename}'
            file_type = 'video' if filename.lower().endswith(('.mp4', '.mov', '.avi', '.webm')) else 'image'
            uploaded.append({'url': file_url, 'type': file_type, 'name': filename})
    
    return jsonify({'uploaded': uploaded})

@app.route('/admin/media/<folder>')
def list_media(folder):
    files = get_media_files(folder)
    return jsonify({'files': files})

@app.route('/admin/media/<folder>/<filename>', methods=['DELETE'])
def delete_media(folder, filename):
    filepath = os.path.join(UPLOAD_FOLDER, folder, filename)
    if os.path.exists(filepath):
        os.remove(filepath)
        return jsonify({'success': True})
    return jsonify({'error': 'File not found'}), 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)