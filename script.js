document.addEventListener('DOMContentLoaded', () => {

    // --- Helper Functions ---

    function validateUPIId(upiId) {
        // Simple regex: basic_string@bank
        const upiRegex = /^[\w\.\-]{3,}@[\w\-]{3,}$/;
        return upiRegex.test(upiId);
    }

    function showError(message) {
        const errorEl = document.getElementById('errorMessage');
        if (errorEl) {
            errorEl.textContent = message;
        }
    }

    function generateQR(upiString) {
        const qrContainer = document.getElementById('qrcode');
        if (!qrContainer) return;
        
        qrContainer.innerHTML = ""; // Clear previous QR
        new QRCode(qrContainer, {
            text: upiString,
            width: 256,
            height: 256,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }

    function downloadQR() {
        const canvas = document.querySelector("#qrcode canvas");
        if (canvas) {
            const image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
            const link = document.createElement('a');
            link.download = "upi_qr_code.png";
            link.href = image;
            link.click();
        } else {
            alert("Error: Could not find QR code canvas.");
        }
    }

    function copyToClipboard(text, buttonElement) {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = buttonElement.textContent;
            buttonElement.textContent = 'Copied!';
            setTimeout(() => {
                buttonElement.textContent = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }

    // --- Page Logic: index.html (Generator Page) ---
    
    const upiForm = document.getElementById('upiForm');
    if (upiForm) {
        upiForm.addEventListener('submit', function(event) {
            event.preventDefault();
            showError(""); // Clear previous errors
            
            const name = document.getElementById('name').value;
            const upiId = document.getElementById('upiId').value;
            const pageTitle = document.getElementById('pageTitle').value;
            const amount = document.getElementById('amount').value;
            
            // Validate UPI ID
            if (!validateUPIId(upiId)) {
                showError("Please enter a valid UPI ID (e.g., yourname@bank)");
                return;
            }

            // Build URL
            const params = new URLSearchParams();
            params.append('upi_id', upiId);
            params.append('name', name);
            if (pageTitle) {
                params.append('title', pageTitle);
            }
            if (amount) {
                params.append('amount', amount);
            }

            // Note: Using '/donate' assumes a server setup. 
            // If these are just static files, change '/donate' to 'donate.html'
            const pageUrl = `/donate?${params.toString()}`;
            const fullUrl = `${window.location.origin}${pageUrl}`;

            // Show result section
            const resultSection = document.getElementById('result');
            const linkInput = document.getElementById('generatedLink');
            const visitBtn = document.getElementById('visitLinkBtn');
            
            linkInput.value = fullUrl;
            visitBtn.href = pageUrl; // Use relative path for the preview button
            resultSection.style.display = 'block';

            // Scroll to the result
            resultSection.scrollIntoView({ behavior: 'smooth' });
        });

        const copyLinkBtn = document.getElementById('copyLinkBtn');
        if (copyLinkBtn) {
            copyLinkBtn.addEventListener('click', function() {
                const linkInput = document.getElementById('generatedLink');
                copyToClipboard(linkInput.value, this);
            });
        }
    }

    // --- Page Logic: donate.html (Payment Page) ---

    const qrContainer = document.getElementById('qrcode');
    if (qrContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const upiId = urlParams.get('upi_id');
        const name = urlParams.get('name');
        const amount = urlParams.get('amount');
        const title = urlParams.get('title'); // Get the new custom title

        if (upiId && name) {
            // 1. Set Page Title
            const pageTitleEl = document.getElementById('pageTitle');
            if (title) {
                pageTitleEl.textContent = title;
            } else {
                pageTitleEl.textContent = `Pay ${name}`; // Default fallback
            }

            // 2. Set Amount Display
            const amountDisplayEl = document.getElementById('amountDisplay');
            if (amount) {
                amountDisplayEl.textContent = `Amount: ₹${amount}`;
            } else {
                amountDisplayEl.textContent = `Paying to: ${name}`;
            }

            // 3. Build UPI String
            let upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&cu=INR`;
            if (amount) {
                upiString += `&am=${encodeURIComponent(amount)}`;
            }
            // You could add your `&tn=Donation` here if you like:
            // upiString += "&tn=Payment via UPI Me";

            // 4. Generate QR
            generateQR(upiString);

            // 5. Wire up buttons
            document.getElementById('openUpiAppBtn').href = upiString;
            document.getElementById('downloadBtn').addEventListener('click', downloadQR);
            
            const copyUpiIdBtn = document.getElementById('copyUpiIdBtn');
            copyUpiIdBtn.addEventListener('click', function() {
                copyToClipboard(upiId, this);
            });

        } else {
            // Handle error: Invalid parameters
            document.body.innerHTML = '<p class="text-red-500 text-center mt-10 text-xl">Error: Missing payment details in URL.</p>';
        }
    }
});