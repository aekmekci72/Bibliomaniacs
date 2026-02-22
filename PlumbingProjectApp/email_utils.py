from typing import Literal, Dict, List, Optional

SENDER_NAME = "Bibliomaniacs Review Team"


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

    Args:
        recipient_email: Email address of the reviewer
        recipient_name: Name of the reviewer
        book_title: Title of the reviewed book
        author: Author of the book
        status: Review status ("approved" or "rejected")
        comment: Optional administrative feedback

    Returns:
        A dictionary containing email metadata and content
    """
    subject = (
        f"Book Review Approved: {book_title}"
        if status == "approved"
        else f"Book Review Status Update: {book_title}"
    )

    comment_message = f"Message from the Editorial Team:\n{comment}\n" if comment else ""

    if status == "approved":
        html_body = f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #2b7a4b;">Book Review Approved</h2>

                        <p>Dear {recipient_name},</p>

                        <p>
                            We are pleased to inform you that your review of
                            <strong>{book_title}</strong> by {author} has been approved and will be published.
                        </p>

                        <div style="background-color: #f4f8f6; border-left: 4px solid #2b7a4b; padding: 15px; margin: 20px 0;">
                            <p style="margin: 0;">
                                <strong>Volunteer Credit:</strong> 0.5 hours
                            </p>
                        </div>

                        {f'''
                        <div style="background-color: #faf6e8; border-left: 4px solid #b7950b; padding: 15px; margin: 20px 0;">
                            <p style="margin: 0;"><strong>Message from the Editorial Team:</strong></p>
                            <p style="margin-top: 10px;">{comment}</p>
                        </div>
                        ''' if comment else ''}

                        <p>
                            Thank you for your thoughtful contribution. Your work helps readers make
                            informed decisions and strengthens our review community.
                        </p>

                        <p>
                            Sincerely,<br>
                            <strong>{SENDER_NAME}</strong>
                        </p>

                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        <p style="font-size: 12px; color: #999;">
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
                            After careful consideration, we are unable to approve this submission
                            in its current form.
                        </p>

                        {f'''
                        <div style="background-color: #fbeeee; border-left: 4px solid #c0392b; padding: 15px; margin: 20px 0;">
                            <p style="margin: 0;"><strong>Editorial Feedback:</strong></p>
                            <p style="margin-top: 10px;">{comment}</p>
                        </div>
                        ''' if comment else ''}

                        <p>
                            We encourage you to review our submission guidelines and consider
                            submitting a revised version in the future.
                        </p>

                        <p>
                            Sincerely,<br>
                            <strong>{SENDER_NAME}</strong>
                        </p>

                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        <p style="font-size: 12px; color: #999;">
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

            {comment}

            We encourage you to review our guidelines and consider submitting
            a revised version in the future.

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


def generate_bulk_email_drafts(reviews_data: List[Dict]) -> List[Dict[str, str]]:
    """
    Generate email drafts for multiple review notifications.

    Args:
        reviews_data: List of dictionaries containing review details

    Returns:
        List of email draft dictionaries
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
