"use strict";

/* Stripe */

const stripe = Stripe('pk_test_YOUR_STRIPE_PUBLIC_KEY');
const elements = stripe.elements();

// Create elements
const style = {
    base: {
        fontFamily: 'Lucida Grande, sans-serif',
        fontSize: '16px',
    }
};
const cardNumber = elements.create('cardNumber', { style });
const cardExpiry = elements.create('cardExpiry', { style });
const cardCvc = elements.create('cardCvc', { style, placeholder: 'e.g 111' });

// Mount the Elements
cardNumber.mount('#card-number-element');
cardExpiry.mount('#card-expiry-element');
cardCvc.mount('#card-cvc-element');

// Handle the form submission
const paymentForm = document.getElementById('payment-form');
paymentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Create a payment method
    const { token, error } = await stripe.createToken(cardNumber);

    if (error) {
        alert(error.message);
    } else {
        // Send the token to server for processing the payment
        console.log(token);
    }
});

/* Card payment modal */

let cardPaymentModal = document.getElementById("card-payment-modal");

cardPaymentModal.querySelector(".btn-close").addEventListener("click", () => {
    cardPaymentModal.style.display = "none";
});
// Close card payment modal when clicking outside the popup
cardPaymentModal.addEventListener("click", (event) => {
    if (event.target === cardPaymentModal) {
        cardPaymentModal.style.display = "none";
    }
});

document.getElementById("card-button").addEventListener("click", () => {
    if (cardPaymentModal.style.display === "none" || cardPaymentModal.style.display === "") {
        document.querySelector('#payment-form button[type="submit"]').textContent = `
        Pay ${document.querySelector("#total-price").innerText.split(" ")[1]}`;
        cardPaymentModal.style.display = "flex";
    } else {
        cardPaymentModal.style.display = "none";
    }
});