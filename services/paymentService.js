const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

function loadScript(src) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (document.querySelector(`script[src="${src}"]`)) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export const paymentService = {
  isRazorpayConfigured: !!(
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID &&
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID !== 'your-razorpay-key-id' &&
    !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.includes('placeholder')
  ),

  async processPayment({ amount, currency = 'INR', customer, orderId, callback }) {
    const amountInPaise = Math.round(amount * 100);
    const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    if (this.isRazorpayConfigured) {
      // Real Razorpay Flow
      const isLoaded = await loadScript(RAZORPAY_SCRIPT_URL);
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      return new Promise((resolve, reject) => {
        const options = {
          key: key,
          amount: amountInPaise,
          currency: currency,
          name: 'Apex E-Store',
          description: `Order Payment for ${orderId || 'New Purchase'}`,
          handler: function (response) {
            // response = { razorpay_payment_id, razorpay_order_id, razorpay_signature }
            callback({
              success: true,
              paymentId: response.razorpay_payment_id,
              method: 'Online'
            });
            resolve(response);
          },
          prefill: {
            name: customer.name || '',
            email: customer.email || '',
            contact: customer.phone || ''
          },
          theme: {
            color: '#4F46E5' // Indigo 600
          },
          modal: {
            ondismiss: function () {
              reject(new Error('Payment cancelled by user.'));
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      });
    } else {
      // Mock Payment Flow with a beautiful custom popup dialog
      return new Promise((resolve, reject) => {
        // Create custom modal container
        const modalContainer = document.createElement('div');
        modalContainer.id = 'mock-razorpay-modal';
        modalContainer.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300';
        
        modalContainer.innerHTML = `
          <div class="relative w-full max-w-md scale-95 overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 border border-slate-100">
            <!-- Header -->
            <div class="bg-indigo-600 px-6 py-5 text-white flex items-center justify-between">
              <div>
                <h3 class="text-lg font-bold tracking-tight">Razorpay Gateway <span class="text-xs bg-indigo-500 text-indigo-100 px-2 py-0.5 rounded-full ml-2">SIMULATOR</span></h3>
                <p class="text-indigo-100 text-xs mt-0.5">Order ID: ${orderId || 'ord-mock'}</p>
              </div>
              <div class="text-right">
                <span class="text-2xl font-black">₹${amount.toFixed(2)}</span>
              </div>
            </div>
            
            <!-- Body -->
            <div class="p-6" id="modal-body">
              <p class="text-xs text-slate-500 mb-4">Choose a mock payment method to complete your purchase:</p>
              
              <div class="space-y-3">
                <button data-method="UPI" class="payment-opt-btn flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 text-left hover:bg-indigo-50 hover:border-indigo-200 transition-all font-medium text-slate-800">
                  <span class="flex items-center gap-3">
                    <span class="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">UPI</span>
                    <span>UPI (GPay / PhonePe / Paytm)</span>
                  </span>
                  <span class="text-slate-400">→</span>
                </button>

                <button data-method="Card" class="payment-opt-btn flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 text-left hover:bg-indigo-50 hover:border-indigo-200 transition-all font-medium text-slate-800">
                  <span class="flex items-center gap-3">
                    <span class="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">CARD</span>
                    <span>Credit / Debit Card</span>
                  </span>
                  <span class="text-slate-400">→</span>
                </button>

                <button data-method="Net Banking" class="payment-opt-btn flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 text-left hover:bg-indigo-50 hover:border-indigo-200 transition-all font-medium text-slate-800">
                  <span class="flex items-center gap-3">
                    <span class="h-8 w-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-xs">NB</span>
                    <span>Net Banking</span>
                  </span>
                  <span class="text-slate-400">→</span>
                </button>

                <button data-method="Wallet" class="payment-opt-btn flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 text-left hover:bg-indigo-50 hover:border-indigo-200 transition-all font-medium text-slate-800">
                  <span class="flex items-center gap-3">
                    <span class="h-8 w-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">WL</span>
                    <span>Wallets (AmazonPay, Mobikwik)</span>
                  </span>
                  <span class="text-slate-400">→</span>
                </button>
              </div>

              <!-- Action Buttons -->
              <div class="mt-6 flex gap-3 border-t border-slate-100 pt-4">
                <button id="rzp-cancel-btn" class="flex-1 rounded-xl bg-slate-100 hover:bg-slate-200 py-3 text-sm font-semibold text-slate-600 transition-colors">
                  Cancel
                </button>
                <button id="rzp-fail-btn" class="flex-1 rounded-xl bg-rose-50 hover:bg-rose-100 py-3 text-sm font-semibold text-rose-600 transition-colors">
                  Simulate Failure
                </button>
              </div>
            </div>
          </div>
        `;

        document.body.appendChild(modalContainer);

        // Smooth fade-in
        setTimeout(() => {
          modalContainer.querySelector('.scale-95').classList.remove('scale-95');
        }, 10);

        // Cleanup modal
        const cleanup = () => {
          const m = document.getElementById('mock-razorpay-modal');
          if (m) {
            m.querySelector('div').classList.add('scale-95');
            m.classList.add('opacity-0');
            setTimeout(() => m.remove(), 300);
          }
        };

        // Handlers
        const optionButtons = modalContainer.querySelectorAll('.payment-opt-btn');
        optionButtons.forEach(btn => {
          btn.addEventListener('click', (e) => {
            const method = btn.getAttribute('data-method');
            const body = document.getElementById('modal-body');
            
            // Show processing screen
            body.innerHTML = `
              <div class="flex flex-col items-center justify-center py-12">
                <svg class="animate-spin h-10 w-10 text-indigo-600 mb-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <h4 class="text-sm font-bold text-slate-800">Processing Payment...</h4>
                <p class="text-xs text-slate-400 mt-1">Please do not refresh this page.</p>
              </div>
            `;

            // Complete payment after 1.5 seconds
            setTimeout(() => {
              cleanup();
              const paymentId = `pay_mock_${Math.random().toString(36).substr(2, 9)}`;
              callback({
                success: true,
                paymentId,
                method
              });
              resolve({
                success: true,
                paymentId,
                method
              });
            }, 1500);
          });
        });

        // Cancel Button
        const cancelBtn = modalContainer.querySelector('#rzp-cancel-btn');
        cancelBtn.addEventListener('click', () => {
          cleanup();
          reject(new Error('Payment cancelled by user.'));
        });

        // Fail Button
        const failBtn = modalContainer.querySelector('#rzp-fail-btn');
        failBtn.addEventListener('click', () => {
          const body = document.getElementById('modal-body');
          body.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12">
              <div class="h-12 w-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xl mb-4">✕</div>
              <h4 class="text-sm font-bold text-slate-800">Payment Failed</h4>
              <p class="text-xs text-slate-400 mt-1">Simulated transaction error or decline.</p>
            </div>
          `;

          setTimeout(() => {
            cleanup();
            reject(new Error('Simulated transaction failed.'));
          }, 1500);
        });
      });
    }
  }
};
