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
        origin: "Kolkata",
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

// Configuration updated to match C logic
const config = {
    prices: {
        economy: ECONOMY_BASE_PRICE,
        business: BUSINESS_BASE_PRICE
    },
    taxes: 0, // No taxes in C version
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
document.addEventListener('DOMContentLoaded', function() {
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

// Update form options to match C flights
function updateFormOptions() {
    const fromSelect = document.getElementById('from');
    const toSelect = document.getElementById('to');
    
    // Clear existing options except first
    fromSelect.innerHTML = '<option value="">Select Departure City</option>';
    toSelect.innerHTML = '<option value="">Select Destination City</option>';
    
    // Add flight origins and destinations
    const cities = new Set();
    flights.forEach(flight => {
        cities.add(flight.origin);
        cities.add(flight.destination);
    });
    
    cities.forEach(city => {
        fromSelect.innerHTML += `<option value="${city}">${city}</option>`;
        toSelect.innerHTML += `<option value="${city}">${city}</option>`;
    });
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

function validateMobile(mobile) {
    return /^\d{10}$/.test(mobile);
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

// Find flight by origin and destination
function findFlightByRoute(from, to) {
    return flights.find(flight => flight.origin === from && flight.destination === to);
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
            } else if (!validatePassport(value)) {
                showFieldError('passportNumber', 'Invalid passport format. Must be 1 capital letter + 7 digits (e.g., A1234567)');
            } else if (!isUniquePassport(value)) {
                showFieldError('passportNumber', 'This passport number is already used');
            } else {
                clearFieldError('passportNumber');
            }
        });
    }
    
    if (email) {
        email.addEventListener('blur', () => {
            const value = email.value.trim();
            if (!value) {
                showFieldError('email', 'Email address is required');
            } else if (!validateEmail(value)) {
                showFieldError('email', 'Please enter a valid email address');
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
            } else if (!validateMobile(value)) {
                showFieldError('phone', 'Mobile number must be exactly 10 digits');
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

// Destination Filtering
function setupDestinationFiltering() {
    const fromSelect = document.getElementById('from');
    const toSelect = document.getElementById('to');
    
    if (fromSelect && toSelect) {
        fromSelect.addEventListener('change', function() {
            const selectedFrom = this.value;
            const toOptions = toSelect.querySelectorAll('option');
            
            toOptions.forEach(option => {
                if (option.value === selectedFrom) {
                    option.style.display = 'none';
                } else {
                    option.style.display = 'block';
                }
            });
            
            // Reset destination if it's the same as departure
            if (toSelect.value === selectedFrom) {
                toSelect.value = '';
            }
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
            method.addEventListener('change', function() {
                // Hide all payment details
                if (cardDetails) cardDetails.style.display = 'none';
                if (upiDetails) upiDetails.style.display = 'none';
                if (netbankingDetails) netbankingDetails.style.display = 'none';
                
                // Show selected payment method details
                switch(this.value) {
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
        cardNumber.addEventListener('input', function() {
            let value = this.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            this.value = formattedValue;
        });
    }
    
    // Format expiry date input
    const expiryDate = document.getElementById('expiryDate');
    if (expiryDate) {
        expiryDate.addEventListener('input', function() {
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

// Fare Calculator
function setupFareCalculator() {
    const seatClassSelect = document.getElementById('seatClass');
    const baseFareElement = document.getElementById('baseFare');
    const taxesElement = document.getElementById('taxes');
    const totalFareElement = document.getElementById('totalFare');
    
    if (seatClassSelect) {
        seatClassSelect.addEventListener('change', function() {
            const selectedClass = this.value;
            if (selectedClass && config.prices[selectedClass]) {
                const baseFare = config.prices[selectedClass];
                const taxes = config.taxes;
                const total = baseFare + taxes;
                
                baseFareElement.textContent = `₹${baseFare.toLocaleString()}`;
                taxesElement.textContent = `₹${taxes.toLocaleString()}`;
                totalFareElement.textContent = `₹${total.toLocaleString()}`;
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
    
    // Validation
    if (!validateBookingData(bookingData)) {
        return;
    }
    
    // Find the flight
    const flight = findFlightByRoute(bookingData.from, bookingData.to);
    if (!flight) {
        showNotification('error', '❌', 'No flight available for this route!');
        return;
    }
    
    // Check passport uniqueness
    if (!isUniquePassport(bookingData.passportNumber)) {
        showNotification('error', '❌', 'Passport number already used!');
        return;
    }
    
    // Store booking data for later use
    currentBookingData = bookingData;
    
    // Show seat selection for the specific flight and class
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
        const isAvailable = seat.status === CANCELLED;
        const actualSeatIndex = selectedClass === 'business' ? index : index + 5;
        seatsHTML += `
            <button class="seat-btn ${isAvailable ? 'available' : 'occupied'}" 
                    ${isAvailable ? `onclick="selectSeatForBooking(${actualSeatIndex}, '${flight.flightNumber}', ${JSON.stringify(bookingData).replace(/"/g, '&quot;')})"` : 'disabled'}>
                ${seat.seatNumber}
            </button>
        `;
    });
    
    modalBody.innerHTML = `
        <div class="flight-seat-selection">
            <div class="flight-info">
                <h4>${flight.flightNumber}: ${flight.origin} → ${flight.destination}</h4>
            </div>
            
            <div class="seat-class-section">
                <h5>${classTitle} - ₹${classPrice.toLocaleString()}</h5>
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

function selectSeatForBooking(seatIndex, flightNumber, bookingData) {
    const flight = flights.find(f => f.flightNumber === flightNumber);
    const seat = flight.seats[seatIndex];
    
    // Store seat and flight info for payment
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
            <div class="summary-row total">
                <span>Total Amount:</span>
                <span>₹${seat.price.toLocaleString()}</span>
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
        
        // Book the seat
        seat.passport = currentBookingData.passportNumber;
        seat.name = currentBookingData.passengerName;
        seat.email = currentBookingData.email;
        seat.status = BOOKED;
        
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
        }, 3000);
        
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
    if (!validateMobile(data.phone)) errors.push('Mobile number must be exactly 10 digits');
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
    }
`;

// Inject custom styles
const styleSheet = document.createElement('style');
styleSheet.textContent = customStyles;
document.head.appendChild(styleSheet);