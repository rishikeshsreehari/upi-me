// script.js

function validateUPIId(upiId) {
    const upiRegex = /^[\w\.\-]{3,}@[\w\-]{3,}$/;
    return upiRegex.test(upiId);
}

function showError(message) {
    document.getElementById('errorMessage').textContent = message;
}

function generateQR(upiId, name, amount) {
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = "";
    
    let upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&tn=Donation`;
    if (amount) {
        upiLink += `&am=${amount}`;
    }
    
    new QRCode(qrContainer, {
        text: upiLink,
        width: 256,
        height: 256,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });
}

function downloadQR() {
    const canvas = document.querySelector("#qrcode canvas");
    const image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    const link = document.createElement('a');
    link.download = "upi_qr_code.png";
    link.href = image;
    link.click();
}

// Form submission on index.html
if (document.getElementById('upiForm')) {
    document.getElementById('upiForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const name = document.getElementById('name').value;
        const upiId = document.getElementById('upiId').value;
        const amount = document.getElementById('amount').value;
        
        if (validateUPIId(upiId)) {
            let url = `donate?upi_id=${encodeURIComponent(upiId)}&name=${encodeURIComponent(name)}`;
            if (amount) {
                url += `&amount=${encodeURIComponent(amount)}`;
            }
            window.location.href = url;
        } else {
            showError("Invalid UPI ID format");
        }
    });
}

// Donation page logic
if (document.getElementById('qrcode')) {
    const urlParams = new URLSearchParams(window.location.search);
    const upiId = urlParams.get('upi_id');
    const name = urlParams.get('name');
    const amount = urlParams.get('amount');

    if (upiId && name) {
        document.getElementById('recipientName').textContent = name;
        generateQR(upiId, name, amount);
        document.getElementById('downloadBtn').addEventListener('click', downloadQR);
        
        if (amount) {
            document.getElementById('amountDisplay').textContent = `Amount: ₹${amount}`;
        } else {
            document.getElementById('amountDisplay').style.display = 'none';
        }
    } else {
        document.body.innerHTML = '<p class="text-red-500 text-center mt-10">Invalid URL parameters</p>';
    }
}