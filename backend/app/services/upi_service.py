import urllib.parse

def generate_upi_uri(payee_upi: str, payee_name: str, amount: float, note: str = "RoomSync Rent/Expense") -> str:
    """
    Generates standard NPCI Indian Unified Payments Interface (UPI) URI.
    Format: upi://pay?pa=...&pn=...&am=...&cu=INR&tn=...
    """
    params = {
        "pa": payee_upi.strip(),
        "pn": payee_name.strip(),
        "am": f"{amount:.2f}",
        "cu": "INR",
        "tn": note.strip()
    }
    encoded = urllib.parse.urlencode(params)
    return f"upi://pay?{encoded}"

def generate_mock_qr_svg(upi_uri: str, payee_name: str, amount: float) -> str:
    """
    Generates a clean SVG QR code visual mockup for Indian UPI apps.
    """
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240" class="rounded-xl shadow-lg">
  <rect width="240" height="240" fill="#0d1117" rx="16"/>
  <rect x="20" y="20" width="200" height="200" fill="#161b22" rx="12" stroke="#00f59b" stroke-width="2"/>
  
  <!-- Outer Finder Patterns -->
  <!-- Top Left -->
  <rect x="35" y="35" width="45" height="45" fill="none" stroke="#00f0ff" stroke-width="4" rx="4"/>
  <rect x="43" y="43" width="29" height="29" fill="#00f59b"/>
  <!-- Top Right -->
  <rect x="160" y="35" width="45" height="45" fill="none" stroke="#00f0ff" stroke-width="4" rx="4"/>
  <rect x="168" y="43" width="29" height="29" fill="#00f59b"/>
  <!-- Bottom Left -->
  <rect x="35" y="160" width="45" height="45" fill="none" stroke="#00f0ff" stroke-width="4" rx="4"/>
  <rect x="43" y="168" width="29" height="29" fill="#00f59b"/>

  <!-- Matrix Pattern Dots -->
  <circle cx="100" cy="45" r="4" fill="#00f59b"/>
  <circle cx="120" cy="45" r="4" fill="#ffd600"/>
  <circle cx="140" cy="45" r="4" fill="#00f0ff"/>
  <circle cx="90" cy="65" r="4" fill="#00f0ff"/>
  <circle cx="110" cy="65" r="4" fill="#00f59b"/>
  <circle cx="130" cy="65" r="4" fill="#ffd600"/>
  <circle cx="100" cy="85" r="4" fill="#00f59b"/>
  <circle cx="120" cy="85" r="4" fill="#00f59b"/>
  <circle cx="140" cy="85" r="4" fill="#00f0ff"/>

  <!-- Middle Matrix Data -->
  <rect x="40" y="100" width="160" height="40" fill="#0d1117" rx="6" stroke="#30363d"/>
  <text x="120" y="120" fill="#00f59b" font-size="11" font-family="monospace" text-anchor="middle" font-weight="bold">BHIM UPI • ₹{amount:,.0f}</text>
  <text x="120" y="133" fill="#8b949e" font-size="9" font-family="sans-serif" text-anchor="middle">Scan via GPay / PhonePe / Paytm</text>

  <!-- Bottom Data -->
  <circle cx="100" cy="160" r="4" fill="#00f0ff"/>
  <circle cx="120" cy="160" r="4" fill="#ffd600"/>
  <circle cx="140" cy="160" r="4" fill="#00f59b"/>
  <circle cx="160" cy="160" r="4" fill="#00f59b"/>
  <circle cx="100" cy="180" r="4" fill="#ffd600"/>
  <circle cx="120" cy="180" r="4" fill="#00f0ff"/>
  <circle cx="140" cy="180" r="4" fill="#ffd600"/>
  <circle cx="160" cy="180" r="4" fill="#00f59b"/>
  <circle cx="180" cy="180" r="4" fill="#00f0ff"/>
  <circle cx="100" cy="200" r="4" fill="#00f59b"/>
  <circle cx="120" cy="200" r="4" fill="#00f0ff"/>
  <circle cx="140" cy="200" r="4" fill="#ffd600"/>
  <circle cx="160" cy="200" r="4" fill="#00f59b"/>
</svg>"""
    return svg
