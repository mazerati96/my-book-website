// ============================================
// book-progress.js — Shared progress bar
// Uses Firebase Realtime Database (compat SDK)
// Keys off data-book-id on the container div
// Edit UI visible to isAdmin === true users only
// ============================================

(function () {

    var DEFAULT_DATA = {
        stage: 'First Draft',
        percent: 0,
        isComplete: false,
        completeLabel: ''
    };

    // ── Entry point ────────────────────────────────────────────────
    function init() {
        var container = document.querySelector('[data-book-id]');
        if (!container) return;

        var bookId = container.getAttribute('data-book-id');

        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                firebase.database()
                    .ref('users/' + user.uid + '/isAdmin')
                    .once('value')
                    .then(function (snap) {
                        var isAdmin = snap.val() === true;
                        listenAndRender(container, bookId, isAdmin);
                    })
                    .catch(function () {
                        // If read fails, treat as non-admin
                        listenAndRender(container, bookId, false);
                    });
            } else {
                listenAndRender(container, bookId, false);
            }
        });
    }

    // ── Realtime listener — re-renders on every DB change ──────────
    function listenAndRender(container, bookId, isAdmin) {
        firebase.database()
            .ref('progress/' + bookId)
            .on('value', function (snap) {
                var data = snap.exists()
                    ? Object.assign({}, DEFAULT_DATA, snap.val())
                    : Object.assign({}, DEFAULT_DATA);
                render(container, bookId, data, isAdmin);
            });
    }

    // ── Render progress bar into container ─────────────────────────
    function render(container, bookId, data, isAdmin) {
        // Remove any existing bar before re-rendering
        var existing = container.querySelector('.bp-wrapper');
        if (existing) existing.remove();

        var stage = data.stage;
        var percent = data.percent;
        var isComplete = data.isComplete;
        var completeLabel = data.completeLabel;
        var fillPct = isComplete ? 100 : Math.max(0, Math.min(99, percent));

        var wrapper = document.createElement('div');
        wrapper.className = 'bp-wrapper';

        // ── Meta row (stage label + edit button or pct) ───────────
        var metaRow = document.createElement('div');
        metaRow.className = 'bp-meta';

        var stageEl = document.createElement('span');
        stageEl.className = 'bp-stage' + (isComplete ? ' is-complete' : '');
        stageEl.textContent = isComplete
            ? ('COMPLETE' + (completeLabel ? ' — ' + completeLabel.toUpperCase() : ''))
            : stage.toUpperCase();
        metaRow.appendChild(stageEl);

        var rightEl = document.createElement('span');
        rightEl.className = 'bp-right';

        if (isAdmin) {
            var editBtn = document.createElement('button');
            editBtn.className = 'bp-edit-btn';
            editBtn.textContent = 'EDIT';
            editBtn.addEventListener('click', function () {
                var panel = wrapper.querySelector('.bp-edit-panel');
                if (panel) { panel.remove(); return; }
                buildEditPanel(wrapper, bookId, data);
            });
            rightEl.appendChild(editBtn);
        } else if (!isComplete) {
            rightEl.textContent = fillPct + '%';
        }

        metaRow.appendChild(rightEl);
        wrapper.appendChild(metaRow);

        // ── Progress track ────────────────────────────────────────
        var track = document.createElement('div');
        track.className = 'bp-track';

        var fill = document.createElement('div');
        fill.className = 'bp-fill' + (isComplete ? ' is-complete' : '');
        fill.style.width = '0%';
        track.appendChild(fill);
        wrapper.appendChild(track);

        // ── Percentage / complete label below the bar ─────────────
        var pctLabel = document.createElement('span');
        pctLabel.className = 'bp-pct-label';
        pctLabel.textContent = isComplete
            ? (completeLabel || 'COMPLETE')
            : fillPct + '% Complete';
        wrapper.appendChild(pctLabel);

        container.appendChild(wrapper);

        // Animate fill after paint
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                fill.style.width = fillPct + '%';
            });
        });
    }

    // ── Admin edit panel ───────────────────────────────────────────
    function buildEditPanel(wrapper, bookId, data) {
        var stage = data.stage;
        var percent = data.percent;
        var isComplete = data.isComplete;
        var completeLabel = data.completeLabel;

        var panel = document.createElement('div');
        panel.className = 'bp-edit-panel';

        // Stage field
        var stageField = makeField('bp-stage-input', 'STAGE / VERSION', 'text',
            stage, 'e.g. Fifth Draft, Copy Edits…');
        panel.appendChild(stageField.wrapper);

        // Percent field
        var pctField = makeField('bp-percent-input', 'COMPLETION % (0 – 99)', 'number',
            percent, '');
        pctField.input.min = 0;
        pctField.input.max = 99;
        if (isComplete) pctField.wrapper.style.opacity = '0.4';
        panel.appendChild(pctField.wrapper);

        // Complete checkbox
        var cbRow = document.createElement('div');
        cbRow.className = 'bp-cb-row';
        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.id = 'bp-complete-cb';
        cb.checked = isComplete;
        var cbLabel = document.createElement('label');
        cbLabel.htmlFor = 'bp-complete-cb';
        cbLabel.textContent = 'MARK AS COMPLETE';
        cbRow.appendChild(cb);
        cbRow.appendChild(cbLabel);
        panel.appendChild(cbRow);

        // Complete label field (only visible when checkbox is checked)
        var clField = makeField('bp-complete-label', 'COMPLETION LABEL (shown on badge)',
            'text', completeLabel, 'e.g. Published, Available Now…');
        clField.wrapper.style.display = isComplete ? 'flex' : 'none';
        panel.appendChild(clField.wrapper);

        cb.addEventListener('change', function () {
            pctField.wrapper.style.opacity = cb.checked ? '0.4' : '1';
            clField.wrapper.style.display = cb.checked ? 'flex' : 'none';
        });

        // Actions row
        var actions = document.createElement('div');
        actions.className = 'bp-actions';

        var saveBtn = document.createElement('button');
        saveBtn.className = 'bp-save-btn';
        saveBtn.textContent = 'SAVE';

        var cancelBtn = document.createElement('button');
        cancelBtn.className = 'bp-cancel-btn';
        cancelBtn.textContent = 'CANCEL';

        var savedMsg = document.createElement('span');
        savedMsg.className = 'bp-saved-msg';
        savedMsg.textContent = 'SAVED ✓';

        actions.appendChild(saveBtn);
        actions.appendChild(cancelBtn);
        actions.appendChild(savedMsg);
        panel.appendChild(actions);

        cancelBtn.addEventListener('click', function () { panel.remove(); });

        saveBtn.addEventListener('click', function () {
            var newData = {
                stage: stageField.input.value.trim() || 'First Draft',
                percent: Math.max(0, Math.min(99,
                    parseInt(pctField.input.value, 10) || 0)),
                isComplete: cb.checked,
                completeLabel: clField.input.value.trim()
            };

            saveBtn.textContent = 'SAVING…';
            saveBtn.disabled = true;

            firebase.database()
                .ref('progress/' + bookId)
                .set(newData)
                .then(function () {
                    // Realtime listener re-renders automatically
                    savedMsg.classList.add('visible');
                    setTimeout(function () {
                        savedMsg.classList.remove('visible');
                    }, 2200);
                    saveBtn.textContent = 'SAVE';
                    saveBtn.disabled = false;
                    panel.remove();
                })
                .catch(function (err) {
                    console.error('[BookProgress] Save failed:', err);
                    saveBtn.textContent = 'SAVE FAILED — RETRY';
                    saveBtn.disabled = false;
                });
        });

        wrapper.appendChild(panel);
    }

    // ── Helper: labelled input field ───────────────────────────────
    function makeField(id, labelText, type, value, placeholder) {
        var wrapper = document.createElement('div');
        wrapper.className = 'bp-field';

        var label = document.createElement('label');
        label.htmlFor = id;
        label.textContent = labelText;

        var input = document.createElement('input');
        input.type = type;
        input.id = id;
        input.value = value;
        input.placeholder = placeholder;

        wrapper.appendChild(label);
        wrapper.appendChild(input);
        return { wrapper: wrapper, input: input };
    }

    // ── Boot ───────────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();