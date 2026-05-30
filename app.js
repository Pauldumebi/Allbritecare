document.addEventListener('DOMContentLoaded', () => {
  
  // =========================================================================
  // 1. HEADER SCROLL & MOBILE TOGGLE
  // =========================================================================
  const header = document.getElementById('header');
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  
  window.addEventListener('scroll', () => {
    if (header) {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  });

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
      if (navMenu.style.display === 'flex') {
        navMenu.style.flexDirection = 'column';
        navMenu.style.position = 'absolute';
        navMenu.style.top = '100%';
        navMenu.style.left = '0';
        navMenu.style.width = '100%';
        navMenu.style.backgroundColor = '#ffffff';
        navMenu.style.boxShadow = '0 10px 15px rgba(0,0,0,0.05)';
        navMenu.style.padding = '20px';
        navMenu.style.gap = '16px';
      }
    });
  }

  // =========================================================================
  // 2. HERO SWITCHER (Removed - Refactored to separate sections)
  // =========================================================================

  // =========================================================================
  // 3. CARE COST & NEEDS ESTIMATOR WIDGET (services.html)
  // =========================================================================
  const hoursSlider = document.getElementById('care-hours-slider');
  const btnNext = document.getElementById('btn-estimator-next');
  const btnPrev = document.getElementById('btn-estimator-prev');
  
  if (hoursSlider && btnNext && btnPrev) {
    let currentStep = 1;
    const totalSteps = 3;
    
    // State variables for estimation
    let selectedCareRate = 26; // base hourly rate for Domiciliary Care
    let selectedCareTypeLabel = "Domiciliary Care";
    let careHours = 20;
    let isHourlyMode = true;
    let selectedAddonsTotal = 0;

    const careCards = document.querySelectorAll('.care-type-card');
    const hoursOutput = document.getElementById('hours-output');
    const addonCards = document.querySelectorAll('.need-checkbox-card');
    const durationSubtitle = document.getElementById('duration-subtitle');
    
    // Summary outputs
    const summaryCareType = document.getElementById('summary-care-type');
    const summaryCareRate = document.getElementById('summary-care-rate');
    const summaryDuration = document.getElementById('summary-duration');
    const summaryTotalCost = document.getElementById('summary-total-cost');
    const summaryFrequency = document.getElementById('summary-frequency');

    // Handle Care Type selection
    careCards.forEach(card => {
      card.addEventListener('click', () => {
        careCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        
        const caretype = card.getAttribute('data-caretype');
        selectedCareRate = parseFloat(card.getAttribute('data-rate'));
        selectedCareTypeLabel = card.querySelector('.care-type-name').textContent;
        
        if (caretype === 'livein') {
          isHourlyMode = false;
          hoursSlider.min = 1;
          hoursSlider.max = 7;
          if (hoursSlider.value > 7) {
            hoursSlider.value = 7;
          }
          durationSubtitle.textContent = "How many days of 24/7 Live-in care are required per week?";
        } else {
          isHourlyMode = true;
          hoursSlider.min = 5;
          hoursSlider.max = 168;
          if (hoursSlider.value < 5 || hoursSlider.value > 168) {
            hoursSlider.value = 20;
          }
          durationSubtitle.textContent = "How many hours of support are needed per week?";
        }
        
        careHours = parseInt(hoursSlider.value);
        hoursOutput.textContent = careHours;
        calculateEstimates();
      });
    });

    // Handle Hours slider input
    hoursSlider.addEventListener('input', (e) => {
      careHours = parseInt(e.target.value);
      hoursOutput.textContent = careHours;
      calculateEstimates();
    });

    // Handle Needs checklists choices
    addonCards.forEach(card => {
      card.addEventListener('click', () => {
        card.classList.toggle('selected');
        updateAddonsTotal();
      });
    });

    function updateAddonsTotal() {
      selectedAddonsTotal = 0;
      const selectedAddonCards = document.querySelectorAll('.need-checkbox-card.selected');
      selectedAddonCards.forEach(card => {
        selectedAddonsTotal += parseFloat(card.getAttribute('data-addon'));
      });
      calculateEstimates();
    }

    function calculateEstimates() {
      let totalCost = 0;
      
      if (isHourlyMode) {
        totalCost = (selectedCareRate * careHours) + selectedAddonsTotal;
        if (summaryCareRate) summaryCareRate.textContent = `£${selectedCareRate.toFixed(2)} / hr`;
        if (summaryDuration) summaryDuration.textContent = `${careHours} Hours / Week`;
        if (summaryFrequency) summaryFrequency.textContent = "/ week";
      } else {
        totalCost = (selectedCareRate * careHours) + selectedAddonsTotal;
        if (summaryCareRate) summaryCareRate.textContent = `£${selectedCareRate.toFixed(2)} / day`;
        if (summaryDuration) summaryDuration.textContent = `${careHours} Days / Week`;
        if (summaryFrequency) summaryFrequency.textContent = "/ week";
      }

      if (summaryCareType) summaryCareType.textContent = selectedCareTypeLabel;
      if (summaryTotalCost) summaryTotalCost.textContent = Math.round(totalCost).toLocaleString();
    }

    // Multi-step Navigation Logic
    btnNext.addEventListener('click', () => {
      if (currentStep < totalSteps) {
        document.querySelector(`.estimator-step[data-step="${currentStep}"]`).classList.remove('active');
        currentStep++;
        document.querySelector(`.estimator-step[data-step="${currentStep}"]`).classList.add('active');
        
        btnPrev.removeAttribute('disabled');
        if (currentStep === totalSteps) {
          btnNext.textContent = "Done";
        }
      } else {
        // Form session storage key-value pair pass, redirect to index assessment scheduler
        const querySummary = `Recommended Care: ${selectedCareTypeLabel} | Duration: ${summaryDuration.textContent} | Estimate: £${summaryTotalCost.textContent}/week`;
        sessionStorage.setItem('careEstimateFill', querySummary);
        sessionStorage.setItem('careTypeSelectFill', document.querySelector('.care-type-card.selected').getAttribute('data-caretype'));
        
        window.location.href = "index.html#scheduler";
      }
    });

    btnPrev.addEventListener('click', () => {
      if (currentStep > 1) {
        document.querySelector(`.estimator-step[data-step="${currentStep}"]`).classList.remove('active');
        currentStep--;
        document.querySelector(`.estimator-step[data-step="${currentStep}"]`).classList.add('active');
        
        btnNext.textContent = "Next Step";
        if (currentStep === 1) {
          btnPrev.setAttribute('disabled', 'true');
        }
      }
    });

    // Initialize Estimates on load
    calculateEstimates();
  }

  // Autofill Assessment Scheduler from session storage details (on index.html load)
  const autoFillData = sessionStorage.getItem('careEstimateFill');
  const autoFillType = sessionStorage.getItem('careTypeSelectFill');
  const selectInquiry = document.getElementById('inquiry-type');
  const notesArea = document.getElementById('notes');

  if (autoFillData && notesArea) {
    notesArea.value = `Auto-Filled Price Estimator Summary:\n${autoFillData}`;
    if (selectInquiry && autoFillType) {
      if (autoFillType === 'domiciliary' || autoFillType === 'dementia' || autoFillType === 'supported') {
        selectInquiry.value = 'domiciliary';
      } else if (autoFillType === 'livein') {
        selectInquiry.value = 'livein';
      }
    }
    sessionStorage.removeItem('careEstimateFill');
    sessionStorage.removeItem('careTypeSelectFill');
    
    // Smooth scroll down to assessment card
    setTimeout(() => {
      const schedulerSection = document.getElementById('scheduler');
      if (schedulerSection) {
        schedulerSection.scrollIntoView({ behavior: 'smooth' });
      }
      showToast("Selected care cost estimates preloaded into the booking form!");
    }, 600);
  }

  // =========================================================================
  // 4. REGULATORY DIAGNOSTIC COMPLIANCE QUIZ (index.html)
  // =========================================================================
  const quizBody = document.getElementById('quiz-body');
  const quizQuestionEl = document.getElementById('quiz-question');
  const quizOptionsEl = document.getElementById('quiz-options');
  const quizResultsEl = document.getElementById('quiz-results');

  if (quizBody && quizQuestionEl && quizOptionsEl && quizResultsEl) {
    const quizQuestions = [
      {
        q: "Does your care facility hold up-to-date and audited Mental Capacity Assessments for all active care plans?",
        options: [
          { text: "Yes, completed and audited quarterly", score: 3 },
          { text: "Completed, but not audited in over 6 months", score: 1 },
          { text: "No, mental capacity logs are incomplete", score: 0 }
        ]
      },
      {
        q: "Are Deprivation of Liberty Safeguards (DoLS) authorisations clearly logged with active expiry warnings?",
        options: [
          { text: "Fully logged with automated alerts and calendar indicators", score: 3 },
          { text: "Logs exist but expiry dates are checked manually", score: 1 },
          { text: "No active registers or tracking logs in place", score: 0 }
        ]
      },
      {
        q: "How prepared is your care staff for an unannounced CQC inspection or quality audit?",
        options: [
          { text: "Extremely prepared with digital training proofs readily accessible", score: 3 },
          { text: "Partially prepared; training records exist but are hard to aggregate", score: 1 },
          { text: "Unprepared; staff lacks formal mock audit exposure", score: 0 }
        ]
      },
      {
        q: "Do you have access to independent Best Interest Assessors (BIA) for capacity decisions?",
        options: [
          { text: "Yes, external qualified BIAs always review complex changes", score: 3 },
          { text: "Usually rely on internal team and basic checklists", score: 1 },
          { text: "Rarely or never utilize qualified BIAs", score: 0 }
        ]
      }
    ];

    let quizCurrentIndex = 0;
    let quizTotalScore = 0;

    const quizStepText = document.getElementById('quiz-step-text');
    const quizProgressFill = document.getElementById('quiz-progress-fill');

    function renderQuizQuestion() {
      const qData = quizQuestions[quizCurrentIndex];
      if (quizStepText) quizStepText.textContent = `Question ${quizCurrentIndex + 1} of ${quizQuestions.length}`;
      
      // Update progress bar
      const progressPercent = ((quizCurrentIndex + 1) / quizQuestions.length) * 100;
      if (quizProgressFill) quizProgressFill.style.width = `${progressPercent}%`;
      
      quizQuestionEl.textContent = qData.q;
      quizOptionsEl.innerHTML = '';
      
      qData.options.forEach((opt) => {
        const button = document.createElement('button');
        button.className = 'quiz-option';
        button.textContent = opt.text;
        button.setAttribute('data-score', opt.score);
        button.addEventListener('click', () => handleQuizAnswer(opt.score));
        quizOptionsEl.appendChild(button);
      });
    }

    function handleQuizAnswer(score) {
      quizTotalScore += score;
      quizCurrentIndex++;
      
      if (quizCurrentIndex < quizQuestions.length) {
        quizBody.style.opacity = '0';
        setTimeout(() => {
          renderQuizQuestion();
          quizBody.style.opacity = '1';
        }, 200);
      } else {
        showQuizResults();
      }
    }

    function showQuizResults() {
      quizBody.style.display = 'none';
      quizResultsEl.style.display = 'flex';
      if (quizStepText) quizStepText.textContent = "Diagnostic Complete";
      if (quizProgressFill) quizProgressFill.style.width = "100%";
      
      const maxScore = quizQuestions.length * 3;
      const scorePercent = Math.round((quizTotalScore / maxScore) * 100);
      
      const ringEl = document.getElementById('quiz-score-ring');
      const headingEl = document.getElementById('quiz-result-heading');
      const feedbackEl = document.getElementById('quiz-result-feedback');
      
      ringEl.textContent = `${scorePercent}%`;
      
      if (scorePercent >= 80) {
        ringEl.style.borderColor = "#10b981";
        ringEl.style.color = "#047857";
        headingEl.textContent = "Strong Compliance Health";
        feedbackEl.textContent = "Your facility demonstrates excellent regulatory structures. To keep audit standards high, perform yearly CQC mock inspection reviews.";
      } else if (scorePercent >= 40) {
        ringEl.style.borderColor = "#d97706";
        ringEl.style.color = "#b45309";
        headingEl.textContent = "Moderate Compliance Vulnerabilities";
        feedbackEl.textContent = "Slight risk detected in mental capacity and DoLS authorization procedures. A detailed independent records audit can help prevent critical feedback from CQC inspectors.";
      } else {
        ringEl.style.borderColor = "#ef4444";
        ringEl.style.color = "#b91c1c";
        headingEl.textContent = "Critical Compliance Warning";
        feedbackEl.textContent = "Severe compliance gaps in statutory assessment processes and staff preparation. Immediate regulatory intervention is highly advised to avoid negative regulatory assessments.";
      }
    }

    renderQuizQuestion();
  }

  // =========================================================================
  // 5. CLIENT & FAMILY PORTAL SIMULATION (index.html)
  // =========================================================================
  const portalTabBtns = document.querySelectorAll('.portal-tab-btn');
  const simBodies = document.querySelectorAll('.portal-screen-body');

  if (portalTabBtns.length > 0) {
    portalTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        portalTabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const targetTab = btn.getAttribute('data-portal-tab');
        simBodies.forEach(body => {
          body.classList.remove('active');
          if (body.getAttribute('id') === `sim-body-${targetTab}`) {
            body.classList.add('active');
          }
        });
      });
    });

    // Simulated live-pulse logging additions
    setInterval(() => {
      const liveLog = document.querySelector('.log-timeline');
      const logBody = document.getElementById('sim-body-logs');
      if (liveLog && logBody && logBody.classList.contains('active')) {
        const activeEntry = liveLog.querySelector('.log-entry.active');
        if (activeEntry) {
          activeEntry.classList.remove('active');
        }
        
        const newEntry = document.createElement('div');
        newEntry.className = 'log-entry active';
        
        const now = new Date();
        const mins = now.getMinutes().toString().padStart(2, '0');
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${mins}`;
        
        const updates = [
          "Sarah updated: 'Administered warm tea, client is sitting comfortably.'",
          "Companion Log: 'Hydration Target is 75% complete for today.'",
          "Clinical Log: 'Client took light walking exercises in sunroom.'",
          "Allbrite System: 'Next scheduled visit logged for 12:30.'"
        ];
        
        const randomUpdate = updates[Math.floor(Math.random() * updates.length)];
        newEntry.innerHTML = `<span class="log-time">${timeStr}</span><span class="log-text">${randomUpdate}</span>`;
        
        liveLog.appendChild(newEntry);
        
        if (liveLog.children.length > 3) {
          liveLog.removeChild(liveLog.firstElementChild);
        }
      }
    }, 9000);
  }

  // =========================================================================
  // 6. SCHEDULER & ASSESSMENT BOOKING FORM (index.html)
  // =========================================================================
  const bookingCard = document.getElementById('bookingCard');
  const assessmentForm = document.getElementById('assessmentForm');

  if (assessmentForm && bookingCard) {
    assessmentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const btnSubmit = assessmentForm.querySelector('button[type="submit"]');
      const oldText = btnSubmit.textContent;
      btnSubmit.textContent = "Scheduling...";
      btnSubmit.setAttribute('disabled', 'true');
      
      setTimeout(() => {
        btnSubmit.textContent = oldText;
        btnSubmit.removeAttribute('disabled');
        
        bookingCard.innerHTML = `
          <div style="text-align: center; padding: 40px 20px; animation: scaleIn 0.4s ease forwards;">
            <div style="width: 80px; height: 80px; background-color: var(--primary-blue-ultra-light); border-radius: 50%; color: var(--primary-blue); display: flex; align-items: center; justify-content: center; font-size: 36px; margin: 0 auto 24px auto; border: 2px solid var(--primary-blue);">✓</div>
            <h3 style="font-size: 24px; color: var(--deep-ocean); margin-bottom: 12px;">Booking Requested Successfully!</h3>
            <p style="color: var(--text-secondary); font-size: 15px; margin-bottom: 24px;">Thank you for scheduling a free care assessment. Our Middlesbrough clinical care manager will contact you at <strong>${document.getElementById('phone-number').value}</strong> within 2 hours to confirm your time.</p>
            <button class="btn btn-primary" onclick="window.location.reload();">Book Another Assessment</button>
          </div>
        `;
        
        showToast("Care Assessment booked successfully!");
      }, 1500);
    });
  }

  // =========================================================================
  // 7. JOB APPLICATION FORM (careers.html)
  // =========================================================================
  const jobApplicationForm = document.getElementById('jobApplicationForm');
  const careerFormCard = document.getElementById('careerFormCard');

  if (jobApplicationForm && careerFormCard) {
    jobApplicationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const btnSubmit = jobApplicationForm.querySelector('button[type="submit"]');
      const oldText = btnSubmit.textContent;
      btnSubmit.textContent = "Submitting...";
      btnSubmit.setAttribute('disabled', 'true');
      
      setTimeout(() => {
        btnSubmit.textContent = oldText;
        btnSubmit.removeAttribute('disabled');
        
        careerFormCard.innerHTML = `
          <div style="text-align: center; padding: 30px 10px; animation: scaleIn 0.4s ease forwards;">
            <div style="width: 70px; height: 70px; background-color: var(--primary-blue-ultra-light); border-radius: 50%; color: var(--primary-blue); display: flex; align-items: center; justify-content: center; font-size: 30px; margin: 0 auto 20px auto; border: 2px solid var(--primary-blue);">✓</div>
            <h3 style="font-size: 22px; color: var(--deep-ocean); margin-bottom: 10px;">Application Submitted!</h3>
            <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 20px;">Thank you for applying to join the Allbrite team. Our Middlesbrough operations coordinator will review your profile and contact you within 24 hours.</p>
            <button class="btn btn-primary" onclick="window.location.reload();" style="padding: 10px 20px; font-size: 14px;">Apply for Another Role</button>
          </div>
        `;
        
        showToast("Application submitted successfully!");
      }, 1500);
    });
  }

  // =========================================================================
  // 8. NEWSLETTER SIGNUP FORM (blog.html)
  // =========================================================================
  const newsletterForm = document.getElementById('newsletterForm');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const emailInput = document.getElementById('newsletter-email');
      const btnSubmit = newsletterForm.querySelector('button[type="submit"]');
      const oldText = btnSubmit.textContent;
      
      btnSubmit.textContent = "Joining...";
      btnSubmit.setAttribute('disabled', 'true');
      
      setTimeout(() => {
        btnSubmit.textContent = oldText;
        btnSubmit.removeAttribute('disabled');
        emailInput.value = '';
        
        showToast("Subscribed! Thank you for joining our healthcare newsletter.");
      }, 1200);
    });
  }

  // =========================================================================
  // 9. FAQ ACCORDION WITH LIVE SEARCH & FILTERING (faqs.html)
  // =========================================================================
  const faqItems = document.querySelectorAll('.faq-item');
  const faqSearch = document.getElementById('faq-search');
  const faqCatBtns = document.querySelectorAll('.faq-cat-btn');

  if (faqItems.length > 0) {
    // Accordion Expand/Collapse
    faqItems.forEach(item => {
      const trigger = item.querySelector('.faq-trigger');
      const content = item.querySelector('.faq-content');
      
      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        
        faqItems.forEach(i => {
          i.classList.remove('open');
          i.querySelector('.faq-content').style.maxHeight = null;
        });
        
        if (!isOpen) {
          item.classList.add('open');
          content.style.maxHeight = content.scrollHeight + "px";
        }
      });
    });

    // Live category filtering
    if (faqCatBtns.length > 0) {
      faqCatBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          faqCatBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          filterFAQs();
        });
      });
    }

    // Live text searching
    if (faqSearch) {
      faqSearch.addEventListener('input', filterFAQs);
    }

    function filterFAQs() {
      const query = faqSearch ? faqSearch.value.toLowerCase().trim() : '';
      const activeCatBtn = document.querySelector('.faq-cat-btn.active');
      const activeCat = activeCatBtn ? activeCatBtn.getAttribute('data-faq-cat') : 'all';

      faqItems.forEach(item => {
        const question = item.querySelector('.faq-question').textContent.toLowerCase();
        const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
        const category = item.getAttribute('data-faq-category');
        
        const matchesSearch = question.includes(query) || answer.includes(query);
        const matchesCategory = activeCat === 'all' || category === activeCat;
        
        if (matchesSearch && matchesCategory) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    }
  }

  // =========================================================================
  // 10. TOAST NOTIFICATION UTILITY
  // =========================================================================
  function showToast(message) {
    const toast = document.getElementById('toastMessage');
    const toastText = document.getElementById('toastText');
    
    if (toast && toastText) {
      toastText.textContent = message;
      toast.classList.add('show');
      
      setTimeout(() => {
        toast.classList.remove('show');
      }, 4000);
    }
  }

  // =========================================================================
  // 11. SCROLL REVEAL ANIMATIONS
  // =========================================================================
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-group');
  
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(el => revealObserver.observe(el));
    
    // Automatically trigger hero elements first
    const heroElements = document.querySelectorAll('.hero .reveal, .hero .reveal-left, .hero .reveal-right, .hero .reveal-scale, .hero .reveal-group');
    heroElements.forEach(el => {
      setTimeout(() => {
        el.classList.add('visible');
        revealObserver.unobserve(el);
      }, 150);
    });
  } else {
    // Fallback for older browsers
    revealElements.forEach(el => el.classList.add('visible'));
  }

  // =========================================================================
  // 12. HERO IMAGE SLIDER
  // =========================================================================
  const heroSliderImages = document.querySelectorAll('.hero-main-img');
  const heroSliderDots = document.querySelectorAll('.slider-dot');
  
  if (heroSliderImages.length > 1) {
    let currentSlide = 0;
    const slideInterval = 5000; // rotate every 5 seconds
    let sliderTimer;
    
    function changeSlide(nextSlideIndex) {
      // Remove active class from current image and dot
      heroSliderImages[currentSlide].classList.remove('active');
      if (heroSliderDots.length > 0) {
        heroSliderDots[currentSlide].classList.remove('active');
      }
      
      // Update index
      currentSlide = nextSlideIndex;
      
      // Add active class to new image and dot
      heroSliderImages[currentSlide].classList.add('active');
      if (heroSliderDots.length > 0) {
        heroSliderDots[currentSlide].classList.add('active');
      }
    }
    
    function startSliderTimer() {
      sliderTimer = setInterval(() => {
        const nextSlide = (currentSlide + 1) % heroSliderImages.length;
        changeSlide(nextSlide);
      }, slideInterval);
    }
    
    function resetSliderTimer() {
      clearInterval(sliderTimer);
      startSliderTimer();
    }
    
    // Auto start
    startSliderTimer();
    
    // Event listeners for dots click
    heroSliderDots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        if (index !== currentSlide) {
          changeSlide(index);
          resetSliderTimer();
        }
      });
    });
  }
});
