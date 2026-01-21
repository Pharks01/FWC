# Forever We Cleave - Wedding Website

An elegant, editorial-quality wedding website for Sodienye Tobin and Ayoade Fakeye.

## Features

- **Elegant Design**: Light, timeless, faith-anchored aesthetic with ivory, cream, and soft gold color palette
- **Hero Slideshow**: Full-width slideshow with unlimited photo/video support
- **Love Story**: Beautifully typeset narrative with POV sections
- **Proposal Story**: Photo/video slideshow with elegant typography
- **Event Details**: Traditional and White wedding information with countdown
- **Gallery**: Slideshow and grid view toggle
- **Aso-Ebi**: Separate pages for Bride and Groom sides
- **Registry**: Gratitude note with Amazon registry integration
- **RSVP**: Dedicated RSVP page
- **Admin Panel**: Manage content without developer assistance
- **Media Upload**: Upload photos and videos through admin interface
- **Mobile Responsive**: Works beautifully on all devices

## Installation

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the Flask application:
   ```bash
   python app.py
   ```

3. Open your browser and navigate to `http://localhost:5000`

## Admin Panel

Access the admin panel at `/admin` to:
- Update White Wedding details (date, time, venue, map embed)
- Update contact information (WhatsApp, email)
- Update RSVP link
- Upload photos and videos for hero, proposal, and gallery sections
- Delete uploaded media

## Folder Structure

```
wedding-website/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── templates/            # HTML templates
│   ├── base.html         # Base template
│   ├── index.html        # Homepage
│   ├── registry.html     # Registry page
│   ├── asoebi.html       # Aso-Ebi page
│   ├── rsvp.html         # RSVP page
│   └── admin.html        # Admin panel
├── static/               # Static files
│   ├── css/
│   │   └── style.css     # Main stylesheet
│   ├── js/
│   │   └── main.js       # JavaScript functionality
│   └── uploads/          # Uploaded media
│       ├── hero/         # Hero slideshow media
│       ├── proposal/     # Proposal story media
│       └── gallery/      # Gallery media
└── data/                 # Application data
    └── wedding_data.json # Dynamic content storage
```

## Design System

- **Colors**: Ivory (#FFFEF5), Cream (#F8F6F0), Soft Gold (#D4AF37)
- **Typography**: Cormorant Garamond (serif) for headings, Montserrat (sans-serif) for body
- **Style**: Light, elegant, timeless, magazine-editorial aesthetic

## Contact

For questions about the wedding, please contact:
- WhatsApp: +234 907 410 1930
- Email: foreverwecleave@gmail.com