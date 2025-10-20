import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  Facebook,
  Twitter,
  Linkedin,
  Instagram
} from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
    alert('Thank you for your message! We will get back to you soon.');
  };

  const contactInfo = [
    {
      icon: <MapPin className="h-6 w-6" />,
      title: 'Address',
      details: ['New College Road, near Boys Degree College', 'Taunsa Housing Colony, Taunsa', 'Dera Ghazi Khan, Punjab, Pakistan'],
      color: 'text-primary-600',
      bgColor: 'bg-primary-100'
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: 'Phone',
      details: ['0337-7079560', '064-2601432 (Helpline Center)'],
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-100'
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: 'Email',
      details: ['spt.redeemers@gmail.com'],
      color: 'text-accent-600',
      bgColor: 'bg-accent-100'
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: 'Office Hours',
      details: ['Monday - Friday: 8:00 AM - 5:00 PM', 'Saturday: 9:00 AM - 2:00 PM'],
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const departments = [
    { name: 'General Inquiry', email: 'spt.redeemers@gmail.com' },
    { name: 'Admissions', email: 'spt.redeemers@gmail.com' },
    { name: 'Academic Affairs', email: 'spt.redeemers@gmail.com' },
    { name: 'Student Services', email: 'spt.redeemers@gmail.com' },
    { name: 'IT Support', email: 'spt.redeemers@gmail.com' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-secondary-500 via-secondary-600 to-secondary-700 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
              <Mail className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact <span className="text-accent-400">Us</span></h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Get in touch with us for any questions about admissions, programs, or general inquiries. 
              We're here to help you on your educational journey.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Get in <span className="text-primary-600">Touch</span></h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 hover:shadow-medium transition-all duration-300">
                    <div className={`${info.bgColor} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                      <div className={info.color}>
                        {info.icon}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {info.title}
                    </h3>
                    <div className="space-y-1">
                      {info.details.map((detail, detailIndex) => (
                        <p key={detailIndex} className="text-gray-600 text-sm">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Contacts */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Department <span className="text-secondary-600">Contacts</span></h3>
              <div className="bg-white rounded-2xl shadow-soft overflow-hidden border border-gray-100">
                {departments.map((dept, index) => (
                  <div 
                    key={index} 
                    className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                      index !== departments.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <span className="font-medium text-gray-900">{dept.name}</span>
                    <a 
                      href={`mailto:${dept.email}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
                    >
                      {dept.email}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Follow <span className="text-accent-600">Us</span></h3>
              <div className="flex space-x-4">
                <a 
                  href="#" 
                  className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-soft hover:shadow-medium"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a 
                  href="#" 
                  className="bg-sky-500 text-white p-3 rounded-xl hover:bg-sky-600 transition-all duration-200 shadow-soft hover:shadow-medium"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a 
                  href="#" 
                  className="bg-blue-700 text-white p-3 rounded-xl hover:bg-blue-800 transition-all duration-200 shadow-soft hover:shadow-medium"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a 
                  href="#" 
                  className="bg-pink-600 text-white p-3 rounded-xl hover:bg-pink-700 transition-all duration-200 shadow-soft hover:shadow-medium"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className="bg-white rounded-2xl shadow-strong p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a <span className="text-primary-600">Message</span></h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="+92-xxx-xxxxxxx"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    >
                      <option value="">Select a subject</option>
                      <option value="admissions">Admissions</option>
                      <option value="academic">Academic Programs</option>
                      <option value="support">Student Support</option>
                      <option value="technical">Technical Support</option>
                      <option value="general">General Inquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none transition-colors"
                    placeholder="Please describe your inquiry in detail..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-soft hover:shadow-medium"
                >
                  <Send className="h-5 w-5" />
                  <span>Send Message</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Visit Our <span className="text-secondary-600">Campus</span></h2>
            <p className="text-lg text-gray-600">
              We're located in Taunsa, DG Khan, Punjab, Pakistan
            </p>
          </div>
          
          {/* Placeholder for map */}
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl h-96 flex items-center justify-center border border-gray-200">
            <div className="text-center">
              <div className="p-4 bg-white rounded-full mb-4 shadow-soft">
                <MapPin className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">Interactive map would be integrated here</p>
              <p className="text-sm text-gray-500 mt-2">
                Southern Punjab Redeemers College<br />
                New College Road, near Boys Degree College<br />
                Taunsa Housing Colony, Taunsa, Dera Ghazi Khan
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;

