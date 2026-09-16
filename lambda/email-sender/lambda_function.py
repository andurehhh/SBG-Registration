import json
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.header import Header


def lambda_handler(event, context):
    try:
        print(f"Raw event: {json.dumps(event)}")

        # Try to extract body in different ways
        if 'body' in event:
            if isinstance(event['body'], str):
                body = json.loads(event['body'])
            else:
                body = event['body']
        else:
            # If no 'body' key, the fields might be at top level
            body = event

        print(f"Parsed body: {json.dumps(body)}")

        to = body.get('to')
        subject = body.get('subject')
        html = body.get('html')
        from_email = body.get('from')

        print(f"Extracted: to={to}, subject={subject}, from={from_email}")

        if not all([to, subject, html, from_email]):
            return {
                'statusCode': 400,
                'body': json.dumps({
                    'success': False,
                    'error': 'Missing required fields',
                }),
            }

        gmail_address = os.environ.get('GMAIL_ADDRESS')
        gmail_password = os.environ.get('GMAIL_APP_PASSWORD')

        if not gmail_address or not gmail_password:
            return {
                'statusCode': 500,
                'body': json.dumps({
                    'success': False,
                    'error': 'Missing Gmail credentials',
                }),
            }

        # Build the message with explicit UTF-8 encoding. Without this, the
        # default us-ascii charset breaks on non-ASCII characters used in our
        # branded copy (e.g. "Biñan", en-dashes, bullet separators), which
        # raises UnicodeEncodeError at send time and drops the email.
        message = MIMEMultipart('alternative')
        message['Subject'] = Header(subject, 'utf-8')
        message['From'] = from_email
        message['To'] = to

        part = MIMEText(html, 'html', 'utf-8')
        message.attach(part)

        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(gmail_address, gmail_password)
            server.sendmail(from_email, to, message.as_string())

        return {
            'statusCode': 200,
            'body': json.dumps({
                'success': True,
                'data': {'messageId': 'sent'},
            }),
        }

    except Exception as error:
        print(f'Error: {str(error)}')
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'body': json.dumps({
                'success': False,
                'error': str(error),
            }),
        }
