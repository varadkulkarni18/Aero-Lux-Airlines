// Global variables for data storage - matching C structs
let flights = [
    {
        flightNumber: "FL001",
        origin: "Delhi",
        destination: "Mumbai",
        seats: []
    },
    {
        flightNumber: "FL002",
        origin: "Mumbai",
        destination: "Bengaluru",
        seats: []
    },
    {
        flightNumber: "FL003",
        origin: "Chennai",
        destination: "Hyderabad",
        seats: []
    }
];

let mostRecentSeatFare = 0.0;
let currentBookingData = null;

// Constants matching C defines
const MAX_FLIGHTS = 3;
const MAX_SEATS = 10;
const PASSPORT_LENGTH = 8;
const ECONOMY = 1;
const BUSINESS = 2;
const ECONOMY_BASE_PRICE = 7500.0;
const BUSINESS_BASE_PRICE = 25000.0;
const BOOKED = 1;
const CANCELLED = 0;

// Enhanced configuration with taxes and fees
const config = {
    prices: {
        economy: ECONOMY_BASE_PRICE,
        business: BUSINESS_BASE_PRICE
    },
    taxes: {
        gst: 0.18, // 18% GST
        airportFee: 150,
        fuelSurcharge: 0.05, // 5% fuel surcharge
        serviceFee: 200
    },
    seatLayout: {
        business: { rows: 1, seatsPerRow: 5, prefix: 'B' }, // Seats 1-5
        economy: { rows: 1, seatsPerRow: 5, prefix: 'E' } // Seats 6-10
    }
};

// DOM elements
const loader = document.getElementById('loader');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');
const bookingForm = document.getElementById('bookingForm');
const paymentForm = document.getElementById('paymentForm');
const cancelForm = document.getElementById('cancelForm');
const contactForm = document.getElementById('contactForm');
const ticketsList = document.getElementById('ticketsList');
const ticketSearch = document.getElementById('ticketSearch');
const notification = document.getElementById('notification');
const modal = document.getElementById('modal');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const themeToggle = document.getElementById('themeToggle');

// Initialize application
document.addEventListener('DOMContentLoaded', function () {
    // Initialize loading screen with shorter duration
    setTimeout(() => {
        loader.classList.add('hidden');
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }, 1500); // Reduced from 3000ms to 1500ms

    // Initialize theme
    initializeTheme();

    // Initialize flights and seats matching C logic
    initializeFlights();

    // Initialize seat map
    initializeSeatMap();

    // Set up event listeners
    setupEventListeners();

    // Initialize fare calculator
    setupFareCalculator();

    // Display tickets
    displayTickets();

    // Set minimum date for booking
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('departureDate').min = today;

    // Update form options to match C flights
    updateFormOptions();

    // Initialize scroll animations
    initializeScrollAnimations();

    // Initialize FAQ functionality
    initializeFAQ();
});

// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// Initialize flights with seat structure matching C code
function initializeFlights() {
    for (let i = 0; i < MAX_FLIGHTS; i++) {
        flights[i].seats = [];
        for (let j = 0; j < MAX_SEATS; j++) {
            flights[i].seats[j] = {
                seatNumber: j + 1,
                seatClass: (j < 5) ? BUSINESS : ECONOMY,
                status: CANCELLED,
                price: (j < 5) ? BUSINESS_BASE_PRICE : ECONOMY_BASE_PRICE,
                passport: "",
                name: "",
                email: ""
            };
        }
    }
}

// Update form options to match available routes only
function updateFormOptions() {
    const fromSelect = document.getElementById('from');
    const toSelect = document.getElementById('to');

    // Clear existing options except first
    fromSelect.innerHTML = '<option value="">Select Departure City</option>';
    toSelect.innerHTML = '<option value="">Select Destination City</option>';

    // Add only valid departure cities (origins)
    const origins = [...new Set(flights.map(flight => flight.origin))];
    const destinations = [...new Set(flights.map(flight => flight.destination))];

    origins.forEach(city => {
        fromSelect.innerHTML += `<option value="${city}">${city}</option>`;
    });

    destinations.forEach(city => {
        toSelect.innerHTML += `<option value="${city}">${city}</option>`;
    });
}

// Enhanced mobile number validation
function validateMobile(mobile) {
    // Must be exactly 10 digits
    if (!/^\d{10}$/.test(mobile)) return false;

    // Reject obvious fake numbers
    const fakePatterns = [
        /^0{10}$/, // All zeros
        /^1{10}$/, // All ones
        /^2{10}$/, // All twos
        /^3{10}$/, // All threes
        /^4{10}$/, // All fours
        /^5{10}$/, // All fives
        /^6{10}$/, // All sixes
        /^7{10}$/, // All sevens
        /^8{10}$/, // All eights
        /^9{10}$/, // All nines
        /^1234567890$/, // Sequential
        /^0123456789$/, // Sequential starting with 0
    ];

    for (let pattern of fakePatterns) {
        if (pattern.test(mobile)) return false;
    }

    // Must start with 6, 7, 8, or 9 (Indian mobile numbers)
    if (!/^[6-9]/.test(mobile)) return false;

    return true;
}

// Validation functions matching C code
function validateEmail(email) {
    const atPos = email.indexOf('@');
    const dotPos = email.lastIndexOf('.');
    return (atPos !== -1 && dotPos !== -1 && atPos < dotPos);
}

function validatePassport(passport) {
    if (passport.length !== PASSPORT_LENGTH) return false;
    if (!/^[A-Z]/.test(passport.charAt(0))) return false;
    for (let i = 1; i < PASSPORT_LENGTH; i++) {
        if (!/\d/.test(passport.charAt(i))) return false;
    }
    return true;
}

function isUniquePassport(passport) {
    for (let i = 0; i < MAX_FLIGHTS; i++) {
        for (let j = 0; j < MAX_SEATS; j++) {
            if (flights[i].seats[j].passport === passport) {
                return flights[i].seats[j].status === BOOKED ? false : true;
            }
        }
    }
    return true;
}

function isEmailUsedInFlight(flight, email) {
    return flight.seats.some(seat =>
        seat.email === email && seat.status === BOOKED
    );
}


// Find flight by origin and destination
function findFlightByRoute(from, to) {
    return flights.find(flight => flight.origin === from && flight.destination === to);
}

// Enhanced fare calculation with taxes and fees
function calculateTotalFare(basePrice) {
    const gstAmount = basePrice * config.taxes.gst;
    const fuelSurcharge = basePrice * config.taxes.fuelSurcharge;
    const airportFee = config.taxes.airportFee;
    const serviceFee = config.taxes.serviceFee;

    const totalTaxes = gstAmount + fuelSurcharge + airportFee + serviceFee;
    const totalFare = basePrice + totalTaxes;

    return {
        baseFare: basePrice,
        gst: gstAmount,
        fuelSurcharge: fuelSurcharge,
        airportFee: airportFee,
        serviceFee: serviceFee,
        totalTaxes: totalTaxes,
        totalFare: totalFare
    };
}

// Event Listeners Setup
function setupEventListeners() {
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.getAttribute('data-section');
            navigateToSection(targetSection);

            // Close mobile menu
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Hero buttons navigation
    document.querySelectorAll('[data-section]').forEach(btn => {
        if (!btn.classList.contains('nav-link')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = btn.getAttribute('data-section');
                navigateToSection(targetSection);
            });
        }
    });

    // Forms
    if (bookingForm) bookingForm.addEventListener('submit', handleBookingSubmit);
    if (paymentForm) paymentForm.addEventListener('submit', handlePaymentSubmit);
    if (cancelForm) cancelForm.addEventListener('submit', handleCancelSubmit);
    if (contactForm) contactForm.addEventListener('submit', handleContactSubmit);

    // Search
    if (ticketSearch) ticketSearch.addEventListener('input', handleTicketSearch);

    // Modal close
    document.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Notification close
    document.querySelector('.notification-close').addEventListener('click', hideNotification);

    // Mobile navigation
    navToggle.addEventListener('click', toggleMobileNav);

    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Form validation
    setupFormValidation();

    // Payment method switching
    setupPaymentMethods();

    // Destination filtering
    setupDestinationFiltering();
}

// Form Validation Setup
function setupFormValidation() {
    // Real-time validation for booking form
    const passengerName = document.getElementById('passengerName');
    const passportNumber = document.getElementById('passportNumber');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const from = document.getElementById('from');
    const to = document.getElementById('to');
    const departureDate = document.getElementById('departureDate');
    const seatClass = document.getElementById('seatClass');

    if (passengerName) {
        passengerName.addEventListener('blur', () => validateField('passengerName', 'Passenger name is required'));
    }

    if (passportNumber) {
        passportNumber.addEventListener('blur', () => {
            const value = passportNumber.value.trim();
            if (!value) {
                showFieldError('passportNumber', 'Passport number is required');
            } else if (!/^[A-PR-WYa-pr-wy][0-9]{7}$/.test(value)) {
                showFieldError('passportNumber', 'Invalid Indian passport format (e.g., A1234567)');
            } else {
                clearFieldError('passportNumber');
            }
        });
    }


    if (email) {
        email.addEventListener('blur', () => {
            const value = email.value.trim();
            if (!value) {
                showFieldError('email', 'Email is required');
            } else if (!/^\S+@\S+\.\S+$/.test(value)) {
                showFieldError('email', 'Invalid email format');
            } else {
                clearFieldError('email');
            }
        });
    }


    if (phone) {
        phone.addEventListener('blur', () => {
            const value = phone.value.trim();
            if (!value) {
                showFieldError('phone', 'Mobile number is required');
            } else if (!/^[6-9]\d{9}$/.test(value)) {
                showFieldError('phone', 'Invalid Indian mobile number');
            } else {
                clearFieldError('phone');
            }
        });
    }


    if (from) {
        from.addEventListener('change', () => validateField('from', 'Please select departure city'));
    }

    if (to) {
        to.addEventListener('change', () => validateField('to', 'Please select destination city'));
    }

    if (departureDate) {
        departureDate.addEventListener('change', () => {
            const value = departureDate.value;
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (!value) {
                showFieldError('departureDate', 'Departure date is required');
            } else if (selectedDate < today) {
                showFieldError('departureDate', 'Departure date cannot be in the past');
            } else {
                clearFieldError('departureDate');
            }
        });
    }

    if (seatClass) {
        seatClass.addEventListener('change', () => validateField('seatClass', 'Please select seat class'));
    }
}

function validateField(fieldId, errorMessage) {
    const field = document.getElementById(fieldId);
    const value = field.value.trim();

    if (!value) {
        showFieldError(fieldId, errorMessage);
        return false;
    } else {
        clearFieldError(fieldId);
        return true;
    }
}

function showFieldError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + 'Error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function clearFieldError(fieldId) {
    const errorElement = document.getElementById(fieldId + 'Error');
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

// Enhanced Destination Filtering
function setupDestinationFiltering() {
    const fromSelect = document.getElementById('from');
    const toSelect = document.getElementById('to');

    if (fromSelect && toSelect) {
        fromSelect.addEventListener('change', function () {
            const selectedFrom = this.value;

            // Clear and rebuild destination options
            toSelect.innerHTML = '<option value="">Select Destination City</option>';

            if (selectedFrom) {
                // Find available destinations for selected origin
                const availableDestinations = flights
                    .filter(flight => flight.origin === selectedFrom)
                    .map(flight => flight.destination);

                availableDestinations.forEach(destination => {
                    toSelect.innerHTML += `<option value="${destination}">${destination}</option>`;
                });
            } else {
                // Show all destinations if no origin selected
                const allDestinations = [...new Set(flights.map(flight => flight.destination))];
                allDestinations.forEach(destination => {
                    toSelect.innerHTML += `<option value="${destination}">${destination}</option>`;
                });
            }

            // Reset destination selection
            toSelect.value = '';
        });
    }
}

// Payment Methods Setup
function setupPaymentMethods() {
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    const cardDetails = document.getElementById('cardDetails');
    const upiDetails = document.getElementById('upiDetails');
    const netbankingDetails = document.getElementById('netbankingDetails');

    if (paymentMethods.length > 0) {
        paymentMethods.forEach(method => {
            method.addEventListener('change', function () {
                // Hide all payment details
                if (cardDetails) cardDetails.style.display = 'none';
                if (upiDetails) upiDetails.style.display = 'none';
                if (netbankingDetails) netbankingDetails.style.display = 'none';

                // Show selected payment method details
                switch (this.value) {
                    case 'card':
                        if (cardDetails) cardDetails.style.display = 'block';
                        break;
                    case 'upi':
                        if (upiDetails) upiDetails.style.display = 'block';
                        break;
                    case 'netbanking':
                        if (netbankingDetails) netbankingDetails.style.display = 'block';
                        break;
                }
            });
        });
    }

    // Format card number input
    const cardNumber = document.getElementById('cardNumber');
    if (cardNumber) {
        cardNumber.addEventListener('input', function () {
            let value = this.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            this.value = formattedValue;
        });
    }

    // Format expiry date input
    const expiryDate = document.getElementById('expiryDate');
    if (expiryDate) {
        expiryDate.addEventListener('input', function () {
            let value = this.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            this.value = value;
        });
    }
}

// Navigation
function navigateToSection(sectionId) {
    // Update nav links
    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-section') === sectionId);
    });

    // Update sections
    sections.forEach(section => {
        section.classList.toggle('active', section.id === sectionId);
    });

    // Special handling for different sections
    if (sectionId === 'tickets') {
        displayTickets();
    } else if (sectionId === 'availability') {
        renderSeatMap();
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMobileNav() {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
}

// Enhanced Fare Calculator
function setupFareCalculator() {
    const seatClassSelect = document.getElementById('seatClass');
    const baseFareElement = document.getElementById('baseFare');
    const taxesElement = document.getElementById('taxes');
    const totalFareElement = document.getElementById('totalFare');

    if (seatClassSelect) {
        seatClassSelect.addEventListener('change', function () {
            const selectedClass = this.value;
            if (selectedClass && config.prices[selectedClass]) {
                const fareBreakdown = calculateTotalFare(config.prices[selectedClass]);

                baseFareElement.textContent = `₹${fareBreakdown.baseFare.toLocaleString()}`;
                taxesElement.textContent = `₹${Math.round(fareBreakdown.totalTaxes).toLocaleString()}`;
                totalFareElement.textContent = `₹${Math.round(fareBreakdown.totalFare).toLocaleString()}`;
            } else {
                baseFareElement.textContent = '₹0';
                taxesElement.textContent = '₹0';
                totalFareElement.textContent = '₹0';
            }
        });
    }
}

// Booking System
function handleBookingSubmit(e) {
    e.preventDefault();

    const formData = new FormData(bookingForm);
    const bookingData = Object.fromEntries(formData.entries());

    const { passengerName, passportNumber, email, phone, departureDate, from, to } = bookingData;

    let hasError = false;
    let invalidFields = [];

    // 🔶 Name validation
    if (!passengerName.trim()) {
        showFieldError('passengerName', 'Passenger name is required');
        hasError = true;
        invalidFields.push('Passenger Name');
    } else if (!/^[A-Za-z ]+$/.test(passengerName)) {
        showFieldError('passengerName', 'Only alphabets and spaces allowed');
        hasError = true;
        invalidFields.push('Passenger Name');
    } else {
        clearFieldError('passengerName');
    }

    // 🔶 Passport number (Indian format: 1 letter + 7 digits)
    if (!passportNumber.trim()) {
        showFieldError('passportNumber', 'Passport number is required');
        hasError = true;
        invalidFields.push('Passport Number');
    } else if (!/^[A-PR-WYa-pr-wy][0-9]{7}$/.test(passportNumber)) {
        showFieldError('passportNumber', 'Invalid Indian passport format (e.g., A1234567)');
        hasError = true;
        invalidFields.push('Passport Number');
    } else {
        clearFieldError('passportNumber');
    }

    // 🔶 Mobile number (Indian: starts with 6-9, total 10 digits)
    if (!phone.trim()) {
        showFieldError('phone', 'Mobile number is required');
        hasError = true;
        invalidFields.push('Mobile Number');
    } else if (!/^[6-9]\d{9}$/.test(phone)) {
        showFieldError('phone', 'Invalid Indian mobile number');
        hasError = true;
        invalidFields.push('Mobile Number');
    } else {
        clearFieldError('phone');
    }

    // ❌ STOP BOOKING IF FORMAT IS WRONG
    if (hasError) {
        showNotification('error', '❌', `Please correct: ${invalidFields.join(', ')}`);
        return;
    }


    const flight = findFlightByRoute(from, to);
    if (!flight) {
        showNotification('error', '❌', 'No flight available for this route!');
        return;
    }



    // ✅ Name validation
    if (!passengerName.trim()) {
        showFieldError('passengerName', 'Passenger name is required');
        hasError = true;
    } else if (!/^[A-Za-z ]+$/.test(passengerName)) {
        showFieldError('passengerName', 'Only alphabets and spaces allowed');
        hasError = true;
    } else {
        clearFieldError('passengerName');
    }

    // ✅ Now do passport, email, phone duplicate checks (only with flight + date)
    let matchingRecord = null;

    // 1. Check if same user already booked this same flight + same date
    for (const seat of flight.seats) {
        if (
            seat.status === BOOKED &&
            seat.date === departureDate &&
            seat.passport === passportNumber &&
            seat.email === email &&
            seat.phone === phone
        ) {
            showNotification('error', '❌', 'These details are already used for this flight on this date.');
            return;
        }
    }

    // 2. Check for mismatched identity (reuse of email/passport/phone by someone else)
    for (const seat of flight.seats) {
        if (
            seat.status === BOOKED &&
            seat.date === departureDate &&
            (
                (seat.email === email && (seat.passport !== passportNumber || seat.phone !== phone)) ||
                (seat.passport === passportNumber && (seat.email !== email || seat.phone !== phone)) ||
                (seat.phone === phone && (seat.email !== email || seat.passport !== passportNumber))
            )
        ) {
            if (seat.email === email) {
                showNotification('error', '❌', 'This email address is already linked to another user for this flight and date.');
            } else if (seat.passport === passportNumber) {
                showNotification('error', '❌', 'This passport number is already linked to another user for this flight and date.');
            } else if (seat.phone === phone) {
                showNotification('error', '❌', 'This mobile number is already linked to another user for this flight and date.');
            } else {
                showNotification('error', '❌', 'These details are already linked to another booking.');
            }
            return;
        }

        // 3. Prevent partial identity reuse on other flights or dates
for (const f of flights) {
    for (const s of f.seats) {
        if (s.status !== BOOKED) continue;

        const allMatch = (
            s.passport === passportNumber &&
            s.email === email &&
            s.phone === phone
        );

        const anyOneMatchesButNotAll = (
            (s.email === email || s.passport === passportNumber || s.phone === phone) && !allMatch
        );

        if (anyOneMatchesButNotAll) {
            if (s.email === email && (s.passport !== passportNumber || s.phone !== phone)) {
                showNotification('error', '❌', 'This email address is already linked to another user.');
            } else if (s.passport === passportNumber && (s.email !== email || s.phone !== phone)) {
                showNotification('error', '❌', 'This passport number is already linked to another user.');
            } else if (s.phone === phone && (s.email !== email || s.passport !== passportNumber)) {
                showNotification('error', '❌', 'This mobile number is already linked to another user.');
            } else {
                showNotification('error', '❌', 'These credentials don’t match — booking blocked.');
            }
            return;
        }
    }
}

    }


    // ✅ All clear — proceed to seat selection
    currentBookingData = bookingData;
    showSeatSelection(flight, bookingData);
}


function showSeatSelection(flight, bookingData) {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = `Select Seat - ${flight.flightNumber}`;

    // Filter seats based on selected class
    const selectedClass = bookingData.seatClass;
    let seatsToShow = [];
    let classTitle = '';
    let classPrice = 0;

    if (selectedClass === 'business') {
        seatsToShow = flight.seats.slice(0, 5); // Business seats 1-5
        classTitle = 'Business Class (Seats 1-5)';
        classPrice = BUSINESS_BASE_PRICE;
    } else if (selectedClass === 'economy') {
        seatsToShow = flight.seats.slice(5, 10); // Economy seats 6-10
        classTitle = 'Economy Class (Seats 6-10)';
        classPrice = ECONOMY_BASE_PRICE;
    }

    // Generate seat selection UI for selected class only
    let seatsHTML = '';
    seatsToShow.forEach((seat, index) => {
       const isBookedOnSameDate = seat.status === BOOKED && seat.date === bookingData.departureDate;
const isAvailable = !isBookedOnSameDate;

        const actualSeatIndex = selectedClass === 'business' ? index : index + 5;
        seatsHTML += `
            <button class="seat-btn ${isAvailable ? 'available' : 'occupied'}" 
                    ${isAvailable ? `onclick="selectSeatForBooking(${actualSeatIndex}, '${flight.flightNumber}', '${JSON.stringify(bookingData).replace(/"/g, '&quot;')}')"` : 'disabled'}>
                ${seat.seatNumber}
            </button>
        `;
    });

    const fareBreakdown = calculateTotalFare(classPrice);

    modalBody.innerHTML = `
        <div class="flight-seat-selection">
            <div class="flight-info">
                <h4>${flight.flightNumber}: ${flight.origin} → ${flight.destination}</h4>
            </div>
            
            <div class="seat-class-section">
                <h5>${classTitle}</h5>
                <div class="fare-preview">
                    <p>Base Fare: ₹${fareBreakdown.baseFare.toLocaleString()}</p>
                    <p>Taxes & Fees: ₹${Math.round(fareBreakdown.totalTaxes).toLocaleString()}</p>
                    <p><strong>Total: ₹${Math.round(fareBreakdown.totalFare).toLocaleString()}</strong></p>
                </div>
                <div class="seats-row">
                    ${seatsHTML}
                </div>
            </div>
            
            <div class="seat-legend">
                <div class="legend-item">
                    <div class="seat-btn available small"></div>
                    <span>Available</span>
                </div>
                <div class="legend-item">
                    <div class="seat-btn occupied small"></div>
                    <span>Occupied</span>
                </div>
            </div>
        </div>
    `;

    showModal();
}

function selectSeatForBooking(seatIndex, flightNumber, bookingDataStr) {
    const bookingData = JSON.parse(bookingDataStr.replace(/&quot;/g, '"'));
    const flight = flights.find(f => f.flightNumber === flightNumber);
    const seat = flight.seats[seatIndex];

    // Store seat and flight info for payment
    currentBookingData = bookingData;
    currentBookingData.flight = flight;
    currentBookingData.seat = seat;
    currentBookingData.seatIndex = seatIndex;

    // Close modal
    closeModal();

    // Navigate to payment section
    navigateToSection('payment');

    // Show payment summary
    showPaymentSummary();
}

function showPaymentSummary() {
    const paymentSummary = document.getElementById('paymentSummary');
    const { flight, seat } = currentBookingData;
    const fareBreakdown = calculateTotalFare(seat.price);

    paymentSummary.innerHTML = `
        <div class="booking-summary-details">
            <div class="summary-row">
                <span>Flight:</span>
                <span>${flight.flightNumber}</span>
            </div>
            <div class="summary-row">
                <span>Route:</span>
                <span>${flight.origin} → ${flight.destination}</span>
            </div>
            <div class="summary-row">
                <span>Passenger:</span>
                <span>${currentBookingData.passengerName}</span>
            </div>
            <div class="summary-row">
                <span>Date:</span>
                <span>${formatDate(currentBookingData.departureDate)}</span>
            </div>
            <div class="summary-row">
                <span>Class:</span>
                <span>${seat.seatClass === BUSINESS ? 'Business' : 'Economy'}</span>
            </div>
            <div class="summary-row">
                <span>Seat:</span>
                <span>${seat.seatNumber}</span>
            </div>
            <div class="summary-row">
                <span>Base Fare:</span>
                <span>₹${fareBreakdown.baseFare.toLocaleString()}</span>
            </div>
            <div class="summary-row">
                <span>GST (18%):</span>
                <span>₹${Math.round(fareBreakdown.gst).toLocaleString()}</span>
            </div>
            <div class="summary-row">
                <span>Fuel Surcharge:</span>
                <span>₹${Math.round(fareBreakdown.fuelSurcharge).toLocaleString()}</span>
            </div>
            <div class="summary-row">
                <span>Airport Fee:</span>
                <span>₹${fareBreakdown.airportFee.toLocaleString()}</span>
            </div>
            <div class="summary-row">
                <span>Service Fee:</span>
                <span>₹${fareBreakdown.serviceFee.toLocaleString()}</span>
            </div>
            <div class="summary-row total">
                <span>Total Amount:</span>
                <span>₹${Math.round(fareBreakdown.totalFare).toLocaleString()}</span>
            </div>
        </div>
    `;
}


function handlePaymentSubmit(e) {
    e.preventDefault();

    // Simulate payment processing
    showNotification('info', '⏳', 'Processing payment...');

    setTimeout(() => {
        // Complete the booking
        const { flight, seat, seatIndex } = currentBookingData;
        const fareBreakdown = calculateTotalFare(seat.price);

        // Book the seat
        seat.passport = currentBookingData.passportNumber;
        seat.name = currentBookingData.passengerName;
        seat.email = currentBookingData.email;
        seat.price = Math.round(fareBreakdown.totalFare); // Store total fare including taxes
        seat.date = currentBookingData.departureDate;
        seat.phone = currentBookingData.phone;
        seat.status = BOOKED;

        // ✅ Generate 6-character alphanumeric Booking ID (PNR style)
        const bookingId = generateBookingId();
        seat.bookingId = bookingId;
        seat.date = currentBookingData.departureDate;



        // Update most recent fare
        mostRecentSeatFare = seat.price;

        // Show success
        showBookingConfirmation(flight, seat, currentBookingData);

        // Reset forms
        bookingForm.reset();
        paymentForm.reset();
        document.getElementById('baseFare').textContent = '₹0';
        document.getElementById('taxes').textContent = '₹0';
        document.getElementById('totalFare').textContent = '₹0';

        // Clear current booking data
        currentBookingData = null;

        // Navigate back to home
        setTimeout(() => {
            closeModal();
            navigateToSection('home');
        }, 6000);

    }, 2000);
}

function validateBookingData(data) {
    const errors = [];

    if (!data.passengerName.trim()) errors.push('Passenger name is required');
    if (!data.passportNumber.trim()) errors.push('Passport number is required');
    if (!validatePassport(data.passportNumber)) {
        errors.push('Invalid passport number. Must be 1 capital letter + 7 digits');
    }
    if (!data.email.trim()) errors.push('Email is required');
    if (!validateEmail(data.email)) errors.push('Invalid email address');
    if (!data.phone.trim()) errors.push('Mobile number is required');
    if (!validateMobile(data.phone)) errors.push('Please enter a valid 10-digit Indian mobile number');
    if (!data.from) errors.push('Departure city is required');
    if (!data.to) errors.push('Destination city is required');
    if (data.from === data.to) errors.push('Departure and destination cannot be the same');
    if (!data.departureDate) errors.push('Departure date is required');
    if (!data.seatClass) errors.push('Seat class is required');

    // Date validation
    const selectedDate = new Date(data.departureDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        errors.push('Departure date cannot be in the past');
    }

    if (errors.length > 0) {
        showNotification('error', '❌', errors.join('<br>'));
        return false;
    }

    return true;
}

function showBookingConfirmation(flight, seat, bookingData) {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = 'Booking Confirmed! ✈️';
    modalBody.innerHTML = `
        <div class="booking-confirmation">
            <div class="confirmation-header">
                <h4>Your flight has been booked successfully!</h4>
                <p class="booking-id">Flight: <strong>${flight.flightNumber}</strong></p>
            </div>
            
            <div class="confirmation-details">
                <div class="detail-row">
                    <span class="label">Passenger:</span>
                    <span class="value">${seat.name}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Passport:</span>
                    <span class="value">${seat.passport}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Route:</span>
                    <span class="value">${flight.origin} → ${flight.destination}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Date:</span>
                    <span class="value">${formatDate(bookingData.departureDate)}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Class:</span>
                    <span class="value">${seat.seatClass === BUSINESS ? 'Business' : 'Economy'}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Seat:</span>
                    <span class="value">${seat.seatNumber}</span>
                </div>
                <div class="detail-row total">
                    <span class="label">Total Fare:</span>
                    <span class="value">₹${seat.price.toLocaleString()}</span>
                </div>
            </div>
            
            <div class="confirmation-note">
                <p>📧 A confirmation email has been sent to <strong>${seat.email}</strong></p>
                <p>📱 Please save your booking details for future reference</p>
            </div>
        </div>
    `;

    showModal();
    showNotification('success', '✅', 'Flight booked successfully!');
}

// Ticket Management
function displayTickets() {
    const allBookings = [];

    // Collect all bookings from all flights
    flights.forEach(flight => {
        flight.seats.forEach(seat => {
            if (seat.status === BOOKED || (seat.status === CANCELLED && seat.passport !== "")) {
                allBookings.push({
                    flight: flight,
                    seat: seat
                });
            }
        });
    });

    if (allBookings.length === 0) {
        ticketsList.innerHTML = `
            <div class="no-tickets glass-card">
                <div class="no-tickets-content">
                    <div class="no-tickets-icon">🎫</div>
                    <h3>No Tickets Found</h3>
                    <p>You haven't booked any flights yet.</p>
                    <button class="btn btn-primary" data-section="booking">Book Your First Flight</button>
                </div>
            </div>
        `;

        // Add event listener for the button
        const bookBtn = ticketsList.querySelector('[data-section="booking"]');
        if (bookBtn) {
            bookBtn.addEventListener('click', () => navigateToSection('booking'));
        }

        return;
    }

    ticketsList.innerHTML = allBookings.map(booking => `
        <div class="ticket-card glass-card">
            <div class="ticket-info">
                <div class="ticket-field">
                    <label>Flight</label>
                    <span>${booking.flight.flightNumber}</span>
                </div>
                <div class="ticket-field">
                    <label>Date</label>
                    <span>${formatDate(booking.seat.date)}</span>
                </div>
                <div class="ticket-field">
                    <label>Booking ID</label>
                    <span>${booking.seat.bookingId || 'Not Available'}</span>
                </div>

                <div class="ticket-field">
                    <label>Passenger</label>
                    <span>${booking.seat.name}</span>
                </div>
                <div class="ticket-field">
                    <label>Passport</label>
                    <span>${booking.seat.passport}</span>
                </div>
                <div class="ticket-field">
                    <label>Route</label>
                    <span>${booking.flight.origin} → ${booking.flight.destination}</span>
                </div>
                <div class="ticket-field">
                    <label>Class</label>
                    <span>${booking.seat.seatClass === BUSINESS ? 'Business' : 'Economy'}</span>
                </div>
                <div class="ticket-field">
                    <label>Seat</label>
                    <span>${booking.seat.seatNumber}</span>
                </div>
                <div class="ticket-field">
                    <label>Fare</label>
                    <span>₹${booking.seat.price.toLocaleString()}</span>
                </div>
            </div>
            <div class="ticket-status ${booking.seat.status === BOOKED ? 'confirmed' : 'cancelled'}">
                ${booking.seat.status === BOOKED ? 'Booked' : 'Cancelled'}
            </div>
        </div>
    `).join('');
}

function handleTicketSearch() {
    const searchTerm = ticketSearch.value.toLowerCase();
    const allBookings = [];

    // Collect all bookings
    flights.forEach(flight => {
        flight.seats.forEach(seat => {
            if (seat.status === BOOKED || (seat.status === CANCELLED && seat.passport !== "")) {
                allBookings.push({
                    flight: flight,
                    seat: seat
                });
            }
        });
    });

    const filteredBookings = allBookings.filter(booking =>
        booking.seat.passport.toLowerCase().includes(searchTerm) ||
        booking.seat.name.toLowerCase().includes(searchTerm) ||
        booking.flight.flightNumber.toLowerCase().includes(searchTerm)
    );

    if (filteredBookings.length === 0 && searchTerm) {
        ticketsList.innerHTML = `
            <div class="no-tickets glass-card">
                <div class="no-tickets-content">
                    <div class="no-tickets-icon">🔍</div>
                    <h3>No Results Found</h3>
                    <p>No tickets match your search criteria.</p>
                </div>
            </div>
        `;
        return;
    }

    // Display filtered results
    if (searchTerm) {
        ticketsList.innerHTML = filteredBookings.map(booking => `
            <div class="ticket-card glass-card">
                <div class="ticket-info">
                    <div class="ticket-field">
                        <label>Flight</label>
                        <span>${booking.flight.flightNumber}</span>
                    </div>
                    <div class="ticket-field">
                        <label>Passenger</label>
                        <span>${booking.seat.name}</span>
                    </div>
                    <div class="ticket-field">
                        <label>Passport</label>
                        <span>${booking.seat.passport}</span>
                    </div>
                    <div class="ticket-field">
                        <label>Route</label>
                        <span>${booking.flight.origin} → ${booking.flight.destination}</span>
                    </div>
                    <div class="ticket-field">
                        <label>Class</label>
                        <span>${booking.seat.seatClass === BUSINESS ? 'Business' : 'Economy'}</span>
                    </div>
                    <div class="ticket-field">
                        <label>Seat</label>
                        <span>${booking.seat.seatNumber}</span>
                    </div>
                    <div class="ticket-field">
                        <label>Fare</label>
                        <span>₹${booking.seat.price.toLocaleString()}</span>
                    </div>
                </div>
                <div class="ticket-status ${booking.seat.status === BOOKED ? 'confirmed' : 'cancelled'}">
                    ${booking.seat.status === BOOKED ? 'Booked' : 'Cancelled'}
                </div>
            </div>
        `).join('');
    } else {
        displayTickets();
    }
}

// Cancellation System
function handleCancelSubmit(e) {
    e.preventDefault();

    const formData = new FormData(cancelForm);
    const passportNumber = formData.get('cancelPassport');
    const email = formData.get('cancelEmail');

    // Validate inputs
    if (!passportNumber.trim()) {
        showFieldError('cancelPassport', 'Passport number is required');
        return;
    }

    if (!email.trim()) {
        showFieldError('cancelEmail', 'Email address is required');
        return;
    }

    if (!validateEmail(email)) {
        showFieldError('cancelEmail', 'Please enter a valid email address');
        return;
    }

    // Find booking by passport and email
    let foundBooking = null;
    let foundFlight = null;

    for (let flight of flights) {
        for (let seat of flight.seats) {
            if (seat.passport === passportNumber &&
                seat.email === email &&
                seat.status === BOOKED) {
                foundBooking = seat;
                foundFlight = flight;
                break;
            }
        }
        if (foundBooking) break;
    }

    if (!foundBooking) {
        showNotification('error', '❌', 'No booking found with the provided details!');
        return;
    }

    // Show cancellation confirmation
    showCancellationConfirmation(foundFlight, foundBooking);
}

function showCancellationConfirmation(flight, seat) {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = 'Confirm Cancellation';
    modalBody.innerHTML = `
        <div class="cancellation-confirmation">
            <div class="warning-message">
                <div class="warning-icon">⚠️</div>
                <p>Are you sure you want to cancel this booking?</p>
            </div>
            
            <div class="booking-details">
                <h4>Booking Details:</h4>
                <div class="detail-row">
                    <span class="label">Flight:</span>
                    <span class="value">${flight.flightNumber}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Passenger:</span>
                    <span class="value">${seat.name}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Route:</span>
                    <span class="value">${flight.origin} → ${flight.destination}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Seat:</span>
                    <span class="value">${seat.seatNumber}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Fare:</span>
                    <span class="value">₹${seat.price.toLocaleString()}</span>
                </div>
            </div>
            
            <div class="cancellation-buttons">
                <button class="btn btn-secondary" onclick="closeModal()">Keep Booking</button>
                <button class="btn btn-danger" onclick="confirmCancellation('${flight.flightNumber}', ${seat.seatNumber})">Cancel Booking</button>
            </div>
        </div>
    `;

    showModal();
}

function confirmCancellation(flightNumber, seatNumber) {
    const flight = flights.find(f => f.flightNumber === flightNumber);
    const seat = flight.seats[seatNumber - 1];

    // Cancel the seat
    seat.status = CANCELLED;

    // Close modal
    closeModal();

    // Reset form
    cancelForm.reset();
    clearFieldError('cancelPassport');
    clearFieldError('cancelEmail');

    // Show success message
    showNotification('success', '✅', `Seat ${seatNumber} cancelled successfully on flight ${flightNumber}.`);

    // Refresh tickets display if on tickets page
    if (document.getElementById('tickets').classList.contains('active')) {
        displayTickets();
    }
}

// Contact Form Handler
function handleContactSubmit(e) {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const contactData = Object.fromEntries(formData.entries());

    // Validate contact form
    const errors = [];
    if (!contactData.contactName.trim()) errors.push('Name is required');
    if (!contactData.contactEmail.trim()) errors.push('Email is required');
    if (!validateEmail(contactData.contactEmail)) errors.push('Invalid email address');
    if (!contactData.contactSubject.trim()) errors.push('Subject is required');
    if (!contactData.contactMessage.trim()) errors.push('Message is required');

    if (errors.length > 0) {
        showNotification('error', '❌', errors.join('<br>'));
        return;
    }

    // Simulate sending message
    showNotification('info', '⏳', 'Sending message...');

    setTimeout(() => {
        showNotification('success', '✅', 'Message sent successfully! We\'ll get back to you soon.');
        contactForm.reset();
    }, 1500);
}

// Seat Map System - Updated to match C logic
function initializeSeatMap() {
    // No demo occupied seats - all start as CANCELLED (available)
}

function renderSeatMap() {
    const container = document.getElementById('seatMapContainer');

    let seatMapHTML = '';

    flights.forEach((flight, flightIndex) => {
        seatMapHTML += `
            <div class="flight-section">
                <h3>${flight.flightNumber}: ${flight.origin} → ${flight.destination}</h3>
                
                <div class="class-section business-class">
                    <h4>Business Class (Seats 1-5) - ₹${BUSINESS_BASE_PRICE.toLocaleString()}</h4>
                    <div class="seats-grid" style="grid-template-columns: repeat(5, 40px);">
                        ${flight.seats.slice(0, 5).map(seat => `
                            <div class="seat ${seat.status === CANCELLED ? 'available' : 'occupied'}" 
                                 title="Seat ${seat.seatNumber} - ${seat.status === CANCELLED ? 'Available' : 'Occupied'}">
                                ${seat.seatNumber}
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="class-section economy-class">
                    <h4>Economy Class (Seats 6-10) - ₹${ECONOMY_BASE_PRICE.toLocaleString()}</h4>
                    <div class="seats-grid" style="grid-template-columns: repeat(5, 40px);">
                        ${flight.seats.slice(5, 10).map(seat => `
                            <div class="seat ${seat.status === CANCELLED ? 'available' : 'occupied'}" 
                                 title="Seat ${seat.seatNumber} - ${seat.status === CANCELLED ? 'Available' : ''}">
                                ${seat.seatNumber}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = seatMapHTML;
}

// Scroll Animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const delay = element.getAttribute('data-delay') || '0s';
                element.style.animationDelay = delay;
                element.classList.add('animate__animated');
                observer.unobserve(element);
            }
        });
    }, observerOptions);

    // Observe elements with animation classes
    document.querySelectorAll('.animate__animated').forEach(el => {
        el.classList.remove('animate__animated');
        observer.observe(el);
    });
}

// FAQ Functionality
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all FAQ items
            faqItems.forEach(faqItem => {
                faqItem.classList.remove('active');
            });

            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// Utility Functions
function showNotification(type, icon, message) {
    const notificationIcon = notification.querySelector('.notification-icon');
    const notificationMessage = notification.querySelector('.notification-message');

    notification.className = `notification ${type}`;
    notificationIcon.textContent = icon;
    notificationMessage.innerHTML = message;

    notification.classList.add('show');

    // Auto hide after 5 seconds
    setTimeout(() => {
        hideNotification();
    }, 5000);
}

function hideNotification() {
    notification.classList.remove('show');
}

function showModal() {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Expose functions to global scope for onclick handlers
window.confirmCancellation = confirmCancellation;
window.closeModal = closeModal;
window.selectSeatForBooking = selectSeatForBooking;

// Show most recent fare (matching C calculateTotalFare function)
function displayMostRecentFare() {
    showNotification('info', 'ℹ️', `Most Recent Booking Fare: ₹${mostRecentSeatFare.toLocaleString()}`);
}

// Add fare display button functionality
window.displayMostRecentFare = displayMostRecentFare;

// Add custom styles for enhanced components
const customStyles = `
    .flight-seat-selection {
        text-align: center;
    }
    
    .flight-info h4 {
        color: var(--primary-color);
        margin-bottom: 2rem;
        font-family: 'Orbitron', monospace;
    }
    
    .seat-class-section {
        margin-bottom: 2rem;
    }
    
    .seat-class-section h5 {
        color: var(--text-primary);
        margin-bottom: 1rem;
    }
    
    .fare-preview {
        background: var(--glass-bg);
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1rem;
        border: 1px solid var(--glass-border);
    }
    
    .fare-preview p {
        margin: 0.25rem 0;
        color: var(--text-secondary);
    }
    
    .fare-preview p:last-child {
        color: var(--primary-color);
        font-size: 1.1rem;
    }
    
    .seats-row {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-bottom: 1rem;
    }
    
    .seat-btn {
        width: 40px;
        height: 40px;
        border-radius: 6px;
        border: 2px solid;
        cursor: pointer;
        transition: var(--transition);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.9rem;
        font-weight: 500;
        background: none;
    }
    
    .seat-btn.small {
        width: 20px;
        height: 20px;
        font-size: 0.7rem;
    }
    
    .seat-btn.available {
        background: rgba(78, 205, 196, 0.1);
        border-color: var(--success-color);
        color: var(--success-color);
    }
    
    .seat-btn.available:hover {
        background: rgba(78, 205, 196, 0.3);
        box-shadow: 0 0 10px rgba(78, 205, 196, 0.5);
        transform: scale(1.1);
    }
    
    .seat-btn.occupied {
        background: rgba(255, 82, 82, 0.2);
        border-color: var(--error-color);
        color: var(--error-color);
        cursor: not-allowed;
    }
    
    .seat-legend {
        display: flex;
        justify-content: center;
        gap: 2rem;
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid var(--glass-border);
    }
    
    .legend-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        color: var(--text-secondary);
    }
    
    .booking-summary-details .summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        padding: 0.5rem 0;
        border-bottom: 1px solid var(--glass-border);
    }
    
    .booking-summary-details .summary-row:last-child {
        border-bottom: none;
    }
    
    .booking-summary-details .summary-row.total {
        font-weight: 700;
        font-size: 1.1rem;
        color: var(--primary-color);
        border-top: 2px solid var(--primary-color);
        margin-top: 1rem;
        padding-top: 1rem;
    }
    
    .booking-confirmation,
    .cancellation-confirmation {
        text-align: center;
    }
    
    .confirmation-header h4 {
        color: var(--success-color);
        margin-bottom: 1rem;
        font-family: 'Orbitron', monospace;
    }
    
    .booking-id {
        font-size: 1.1rem;
        color: var(--primary-color);
        margin-bottom: 2rem;
    }
    
    .confirmation-details,
    .booking-details {
        text-align: left;
        margin: 2rem 0;
        padding: 1.5rem;
        background: var(--glass-bg);
        border-radius: 8px;
        border: 1px solid var(--glass-border);
    }
    
    .detail-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        padding: 0.5rem 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .detail-row:last-child {
        border-bottom: none;
    }
    
    .detail-row.total {
        font-weight: 700;
        font-size: 1.1rem;
        color: var(--primary-color);
        border-top: 2px solid var(--primary-color);
        margin-top: 1rem;
        padding-top: 1rem;
    }
    
    .label {
        color: var(--text-secondary);
    }
    
    .value {
        color: var(--text-primary);
        font-weight: 500;
    }
    
    .confirmation-note {
        background: rgba(0, 212, 255, 0.1);
        border: 1px solid var(--primary-color);
        border-radius: 8px;
        padding: 1rem;
        margin-top: 2rem;
    }
    
    .confirmation-note p {
        margin-bottom: 0.5rem;
        color: var(--text-secondary);
    }
    
    .warning-message {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        background: rgba(255, 165, 0, 0.1);
        border: 1px solid var(--warning-color);
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 2rem;
    }
    
    .warning-icon {
        font-size: 2rem;
    }
    
    .warning-message p {
        color: var(--warning-color);
        font-weight: 500;
        margin: 0;
    }
    
    .cancellation-buttons {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 2rem;
    }
    
    @media (max-width: 768px) {
        .cancellation-buttons {
            flex-direction: column;
        }
        
        .detail-row {
            flex-direction: column;
            gap: 0.25rem;
        }
        
        .confirmation-details,
        .booking-details {
            padding: 1rem;
        }
        
        .seats-row {
            gap: 0.25rem;
        }
        
        .seat-btn {
            width: 35px;
            height: 35px;
            font-size: 0.8rem;
        }
        
        .fare-preview {
            padding: 0.75rem;
        }
    }
`;

// Inject custom styles
const styleSheet = document.createElement('style');
styleSheet.textContent = customStyles;
document.head.appendChild(styleSheet);

function generateBookingId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 6; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}
