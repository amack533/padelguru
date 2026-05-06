/* -----------------------------------------------------
   Padel Guru — Booking modal + quick-book interactions
   Demo only: no backend, slots are deterministic mock.
----------------------------------------------------- */

(function () {
    'use strict';

    const MONTH_SHORT = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    const DAY_SHORT   = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

    // ---- Quick book date prefill -----------------------------
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const qDate = document.getElementById('quickDate');
    if (qDate) {
        qDate.value = formatISODate(tomorrow);
        qDate.min = formatISODate(today);
    }

    function formatISODate(d) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    // ---- State -----------------------------------------------
    const state = {
        courtType: 'padel',
        players: 2,
        duration: 90,
        date: tomorrow,
        selected: null,           // { time, courtName, priceIDR }
    };

    // ---- Modal open / close ---------------------------------
    const modal = document.getElementById('bookingModal');
    if (!modal) return;

    document.addEventListener('click', (e) => {
        const opener = e.target.closest('[data-open-booking]');
        if (opener) {
            e.preventDefault();
            // optional preset court via data-preset-court
            const preset = opener.getAttribute('data-preset-court');
            if (preset) {
                state.courtType = preset;
            }
            // sync quick-book values into modal state
            if (qDate && qDate.value) {
                const parts = qDate.value.split('-');
                state.date = new Date(+parts[0], +parts[1]-1, +parts[2]);
            }
            const qPlayers = document.getElementById('quickPlayers');
            if (qPlayers) state.players = parseInt(qPlayers.value, 10);

            openModal();
        }
        if (e.target.closest('[data-close-booking]')) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
            closeModal();
        }
    });

    function openModal() {
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        showStep(1);
        renderControls();
        renderDates();
        renderSlots();
    }

    function closeModal() {
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    }

    function showStep(n) {
        modal.querySelectorAll('.bm-step').forEach((el) => {
            const isActive = parseInt(el.dataset.step, 10) === n;
            el.hidden = !isActive;
        });
        // Update modal title per step
        const titleEl = document.getElementById('bmTitle');
        if (titleEl) {
            if (n === 1) titleEl.textContent = "When are you playing?";
            else if (n === 2) titleEl.textContent = "Confirm your booking";
            else if (n === 3) titleEl.textContent = "All set.";
        }
    }

    // ---- Tab buttons (court type / players / duration) ------
    modal.addEventListener('click', (e) => {
        const tab = e.target.closest('.bm-tab');
        if (!tab) return;
        const group = tab.parentElement;
        group.querySelectorAll('.bm-tab').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        if (tab.hasAttribute('data-court-type')) state.courtType = tab.dataset.courtType;
        if (tab.hasAttribute('data-players'))    state.players = parseInt(tab.dataset.players, 10);
        if (tab.hasAttribute('data-duration'))   state.duration = parseInt(tab.dataset.duration, 10);

        renderSlots();
    });

    function renderControls() {
        // sync state -> active tabs
        modal.querySelectorAll('.bm-tab').forEach((t) => {
            t.classList.remove('active');
            if (t.dataset.courtType === state.courtType) t.classList.add('active');
            if (t.dataset.players && parseInt(t.dataset.players, 10) === state.players) t.classList.add('active');
            if (t.dataset.duration && parseInt(t.dataset.duration, 10) === state.duration) t.classList.add('active');
        });
    }

    // ---- Date strip ----------------------------------------
    function renderDates() {
        const strip = document.getElementById('bmDates');
        strip.innerHTML = '';
        const baseDate = new Date();
        baseDate.setHours(0,0,0,0);
        for (let i = 0; i < 14; i++) {
            const d = new Date(baseDate);
            d.setDate(baseDate.getDate() + i);
            const isSelected = sameDay(d, state.date);
            const el = document.createElement('button');
            el.className = 'bm-date' + (isSelected ? ' selected' : '');
            el.innerHTML =
                `<span class="bm-date-day">${DAY_SHORT[d.getDay()]}</span>` +
                `<span class="bm-date-num">${d.getDate()}</span>` +
                `<span class="bm-date-mo">${MONTH_SHORT[d.getMonth()]}</span>`;
            el.addEventListener('click', () => {
                state.date = d;
                renderDates();
                renderSlots();
            });
            strip.appendChild(el);
        }
    }

    function sameDay(a, b) {
        return a.getFullYear() === b.getFullYear()
            && a.getMonth() === b.getMonth()
            && a.getDate() === b.getDate();
    }

    // ---- Slot rendering ------------------------------------
    function renderSlots() {
        const wrap = document.getElementById('bmSlots');
        const dateLabel = document.getElementById('bmDateLabel');
        wrap.innerHTML = '';

        const dateStr = state.date.toLocaleDateString('en-US', {
            weekday: 'long', day: 'numeric', month: 'long'
        });
        if (dateLabel) dateLabel.textContent = `· ${dateStr}`;

        // Generate slots from 06:00 to 22:00 stepping by duration
        // Some are taken — deterministic from date string for stability
        const seed = state.date.getDate() + state.date.getMonth() * 31;
        const taken = new Set();
        for (let i = 0; i < 5; i++) {
            taken.add( (seed + i*7) % 17 );
        }

        const startHour = 6;
        const endHour = 22;
        const minutes = state.duration;
        const courts = state.courtType === 'padbol'
            ? ['Padbol Court']
            : ['Padel 01', 'Padel 02', 'Padel 03', 'Padel 04'];

        let slotIdx = 0;
        for (let mins = startHour * 60; mins + minutes <= endHour * 60; mins += 60) {
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            const time = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
            const courtName = courts[slotIdx % courts.length];
            const isTaken = taken.has(slotIdx);
            const price = priceFor(state.courtType, state.duration);

            const slot = document.createElement('button');
            slot.className = 'bm-slot' + (isTaken ? ' taken' : '');
            slot.disabled = isTaken;
            slot.innerHTML =
                `<span class="bm-slot-time">${time}</span>` +
                `<span class="bm-slot-court">${isTaken ? 'Booked' : courtName}</span>`;
            if (!isTaken) {
                slot.addEventListener('click', () => {
                    state.selected = { time, courtName, priceIDR: price };
                    showConfirm();
                });
            }
            wrap.appendChild(slot);
            slotIdx++;
        }
    }

    function priceFor(courtType, duration) {
        // Demo pricing
        const padelBase = 280000; // 90 min
        const padbolBase = 220000; // 60 min
        if (courtType === 'padbol') {
            return Math.round(padbolBase * (duration / 60));
        }
        return Math.round(padelBase * (duration / 90));
    }

    function fmtIDR(n) {
        return 'IDR ' + n.toLocaleString('en-US');
    }

    // ---- Step 2: Confirm screen ----------------------------
    function showConfirm() {
        showStep(2);
        const dateStr = state.date.toLocaleDateString('en-US', {
            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
        });
        document.getElementById('cfCourt').textContent = state.selected.courtName;
        document.getElementById('cfDate').textContent = dateStr;
        document.getElementById('cfTime').textContent = state.selected.time;
        document.getElementById('cfPlayers').textContent = state.players + (state.players === 1 ? ' player' : ' players');
        document.getElementById('cfDuration').textContent = state.duration + ' min';
        document.getElementById('cfTotal').textContent = fmtIDR(state.selected.priceIDR);
    }

    modal.addEventListener('click', (e) => {
        if (e.target.matches('[data-step-back]')) {
            showStep(1);
        }
        if (e.target.matches('[data-confirm]')) {
            showSuccess();
        }
    });

    // ---- Step 3: Success ----------------------------------
    function showSuccess() {
        showStep(3);
        const dateStr = state.date.toLocaleDateString('en-US', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
        const card = document.getElementById('cfSuccess');
        card.innerHTML =
            `<strong>${state.selected.courtName} · ${state.selected.time}</strong>` +
            `${dateStr}<br>` +
            `${state.players} players · ${state.duration} min · ${fmtIDR(state.selected.priceIDR)}`;
    }

})();
