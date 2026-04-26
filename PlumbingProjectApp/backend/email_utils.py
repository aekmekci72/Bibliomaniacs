from typing import Literal, Dict, List, Optional

SENDER_NAME = "Bibliomaniacs Review Team"


# =============================
# Patron Review Guidelines
# =============================

PATRON_REVIEW_GUIDELINES_HTML = """
<div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.5;">
    <div style="margin-bottom: 6px;">• 200-400 word count</div>
    <div style="margin-bottom: 6px;">• Include a brief summary of the plot</div>

    <div style="margin-bottom: 4px;">• Discuss aspects of the material such as:</div>
    <div style="margin-left: 16px; margin-bottom: 6px;">
        <div>- Character development</div>
        <div>- Writing style</div>
        <div>- Accuracy of information (for non-fiction)</div>
        <div>- Use of images and how they supported the story</div>
    </div>

    <div style="margin-bottom: 6px;">• Include whether or not you would recommend the material</div>
    <div>• It is completely acceptable to dislike a book, but you must clearly explain why</div>
</div>
"""

PATRON_REVIEW_GUIDELINES_TEXT = """
Patron Review Guidelines:
• 200–400 word count
• Include a brief summary of the plot
• Discuss aspects of the material such as:
  - Characters
  - Writing style
  - Accuracy of information (non-fiction)
  - Use of images and storytelling impact
• Include whether you would recommend the material
• It is acceptable to dislike a book, but you must clearly explain why
"""


# =============================
# Email Generator
# =============================

def generate_email_draft(
    recipient_email: str,
    recipient_name: str,
    book_title: str,
    author: str,
    status: Literal["approved", "rejected"],
    comment: Optional[str] = None
) -> Dict[str, str]:
    """
    Generate an email draft notifying a reviewer of their review status.
    """

    subject = (
        f"Book Review Approved: {book_title}"
        if status == "approved"
        else f"Book Review Status Update: {book_title}"
    )

    comment_message = (
        f"Message from the Editorial Team:\n{comment}\n"
        if comment else ""
    )

    # =============================
    # APPROVED EMAIL
    # =============================

    if status == "approved":

        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2b7a4b;">Book Review Approved</h2>

                    <p>Dear {recipient_name},</p>

                    <p>
                        We are pleased to inform you that your review of
                        <strong>{book_title}</strong> by {author}
                        has been approved and will be published.
                    </p>

                    <div style="background-color: #f4f8f6; border-left: 4px solid #2b7a4b; padding: 15px; margin: 20px 0;">
                        <strong>Volunteer Credit:</strong> 0.5 hours
                    </div>

                    {f'''
                    <div style="background-color: #faf6e8; border-left: 4px solid #b7950b; padding: 15px; margin: 20px 0;">
                        <strong>Message from the Editorial Team:</strong>
                        <p>{comment}</p>
                    </div>
                    ''' if comment else ''}

                    <p>
                        Thank you for your thoughtful contribution.
                        Your work strengthens our review community.
                    </p>

                    <p>
                        Sincerely,<br>
                        <strong>{SENDER_NAME}</strong>
                    </p>

                    <hr>
                    <p style="font-size:12px;color:#999;">
                        This is an automated message. Please do not reply.
                    </p>
                </div>
            </body>
        </html>
        """

        text_body = f"""
Dear {recipient_name},

We are pleased to inform you that your review of "{book_title}" by {author}
has been approved and will be published.

Volunteer Credit: 0.5 hours

{comment_message}

Thank you for your thoughtful contribution to our review community.

Sincerely,
{SENDER_NAME}

---
This is an automated message. Please do not reply.
"""

    # =============================
    # REJECTED EMAIL
    # =============================

    else:

        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #c0392b;">Book Review Status Update</h2>

                    <p>Dear {recipient_name},</p>

                    <p>
                        Thank you for submitting your review of
                        <strong>{book_title}</strong> by {author}.
                    </p>

                    <p>
                        After careful consideration, we are unable to approve
                        this submission in its current form.
                    </p>

                    {f'''
                    <div style="background-color:#fbeeee;border-left:4px solid #c0392b;padding:15px;margin:20px 0;">
                        <strong>Editorial Feedback:</strong>
                        <p>{comment}</p>
                    </div>
                    ''' if comment else ''}

                    <div style="background-color:#f4f8ff;border-left:4px solid #2980b9;padding:15px;margin:20px 0;">
                        Patron Review Guidelines Reminder:
                        {PATRON_REVIEW_GUIDELINES_HTML}
                    </div>

                    <p>
                        We encourage you to revise your review using these
                        guidelines and resubmit in the future.
                    </p>

                    <p>
                        Sincerely,<br>
                        <strong>{SENDER_NAME}</strong>
                    </p>

                    <hr>
                    <p style="font-size:12px;color:#999;">
                        This is an automated message. Please do not reply.
                    </p>
                </div>
            </body>
        </html>
        """

        text_body = f"""
Dear {recipient_name},

Thank you for submitting your review of "{book_title}" by {author}.

After careful consideration, we are unable to approve this submission
in its current form.

{comment if comment else ""}

{PATRON_REVIEW_GUIDELINES_TEXT}

We encourage you to revise your review using these guidelines and
consider resubmitting in the future.

Sincerely,
{SENDER_NAME}

---
This is an automated message. Please do not reply.
"""

    return {
        "to": recipient_email,
        "subject": subject,
        "html_body": html_body,
        "text_body": text_body,
        "status": status,
        "book_title": book_title,
        "reviewer_name": recipient_name,
    }


# =============================
# Bulk Generator
# =============================

def generate_bulk_email_drafts(reviews_data: List[Dict]) -> List[Dict[str, str]]:
    """
    Generate email drafts for multiple review notifications.
    """
    return [
        generate_email_draft(
            recipient_email=review["email"],
            recipient_name=review["name"],
            book_title=review["book_title"],
            author=review["author"],
            status=review["status"],
            comment=review.get("comment"),
        )
        for review in reviews_data
    ]