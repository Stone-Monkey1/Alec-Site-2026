import { useState } from "react"

const EMAIL = "alecpow@gmail.com"

function Contact() {
    const [copied, setCopied] = useState(false);

    async function copyEmail() {
        try {
            await navigator.clipboard.writeText(EMAIL);
            setCopied(true);
            setTimeout(() => setCopied(false), 600);
        } catch (err) {
            console.error("Failed to copy email:", err);
        }
    }
    return (
        <div className="background-secondary-color">
            <div className="p-5pct">
                <h1 className="text-primary-color">Contact</h1>
                <p><a href="https://www.linkedin.com/in/alec-powell-a55103217/">LinkedIn</a></p>
                <p><a href="https://github.com/Stone-Monkey1">GitHub</a></p>
                <p>
                    <button
                        type="button"
                        className="text-button"
                        onClick={copyEmail}
                        title="Click to copy"
                        aria-label={`Copy email address ${EMAIL} to clipboard`}
                    >
                        {copied ? "Copied!" : EMAIL}
                    </button>
                    <span className="visually-hidden" aria-live="polite">
                        {copied ? "Email address copied to clipboard" : ""}
                    </span>
                </p>
            </div>
        </div>
    );
}

export default Contact;
