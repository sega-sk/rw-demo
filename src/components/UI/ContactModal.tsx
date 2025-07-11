import React, { useState } from 'react';
import { X } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle?: string;
  productPrice?: string | number;
}

export default function ContactModal({ isOpen, onClose, productTitle = "2025 Wayne Enterprises Batmobile", productPrice = "Call for Price" }: ContactModalProps) {
  const [formData, setFormData] = useState({
    mainOption: '',
    rentPeriod: '',
    firstName: 'Bruce',
    lastName: 'Wayne',
    email: 'bruce.wayne@wayneenterprises.com',
    phone: '555-BATMAN',
    comment: '',
    consent: true
  });

  const [showCommonFields, setShowCommonFields] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMainOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, mainOption: value, rentPeriod: '' }));
    setShowCommonFields(!!value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.mainOption) {
      alert('Please select Buy or Rent first.');
      return;
    }
    
    if (formData.mainOption === 'rent' && !formData.rentPeriod) {
      alert('Please select a rental period.');
      return;
    }
    
    console.log('Form submitted:', formData);
    
    let message = '';
    if (formData.mainOption === 'buy') {
      message = 'Purchase request submitted! The Dark Knight will contact you soon to finalize your Batmobile purchase.';
    } else {
      message = `${formData.rentPeriod.charAt(0).toUpperCase() + formData.rentPeriod.slice(1)} rental request submitted! Wayne Enterprises will contact you soon to arrange your Batmobile rental.`;
    }
    
    alert(message);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="contact-modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="contact-modal-content bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-6 text-gray-400 hover:text-gray-600 text-2xl"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-6">
          <h2 className="contact-modal-header text-2xl font-semibold text-gray-900 mb-4 font-inter">Get {productTitle.split(' ').pop()}</h2>
          
          <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-lg">
            <div className="w-16 h-12 bg-black rounded flex items-center justify-center">
              <OptimizedImage
                src="/logo.png"
                alt="Product"
                size="thumbnail"
                className="w-full h-full object-contain"
                fallback={<span className="text-yellow-500 text-xs font-bold">PRODUCT</span>}
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 font-inter">{productTitle}</h3>
            </div>
            <div className="text-lg font-bold text-gray-900 font-inter">{productPrice}</div>
            {typeof productPrice === 'string' && productPrice === 'Call for Price' && (
              <div className="text-xs text-gray-500 font-inter mt-1">Contact us for pricing details</div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
          <div className="contact-modal-form space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                Select Option<span className="text-red-500 ml-1">*</span>
              </label>
              <select
                name="mainOption"
                value={formData.mainOption}
                onChange={handleMainOptionChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-inter"
              >
                <option value="">Choose an option...</option>
                <option value="buy">Buy</option>
                <option value="rent">Rent</option>
              </select>
            </div>

            {formData.mainOption === 'rent' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                  Rental Period<span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  name="rentPeriod"
                  value={formData.rentPeriod}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-inter"
                >
                  <option value="">Choose rental period...</option>
                  <option value="daily">Daily - $5,000/day</option>
                  <option value="weekly">Weekly - $30,000/week</option>
                  <option value="monthly">Monthly - $100,000/month</option>
                  <option value="yearly">Yearly - $1,000,000/year</option>
                </select>
              </div>
            )}

            {showCommonFields && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                      First Name<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-inter"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                      Last Name<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-inter"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                    Email<span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-inter"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-inter"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Comments</label>
                  <textarea
                    name="comment"
                    value={formData.comment}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Enter your comments here..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-inter"
                  />
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={formData.consent}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                  <label className="text-sm text-gray-600 font-inter">
                    Wayne Enterprises may text me updates about my inquiry or appointment. Message and data rates may apply. 
                    Message frequency varies. Reply HELP for help or STOP to opt out.{' '}
                    <a href="#" className="text-blue-600 underline">Privacy Policy</a>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors font-inter"
                >
                  {formData.mainOption === 'buy' ? 'Get Purchase Quote' : 'Get Rental Quote'}
                </button>
              </>
            )}

            {!showCommonFields && (
              <button
                type="button"
                disabled
                className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg font-semibold cursor-not-allowed font-inter"
              >
                Select an option first
              </button>
            )}
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}