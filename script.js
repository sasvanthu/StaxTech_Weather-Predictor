document.addEventListener('DOMContentLoaded', () => {
    const passwordLengthInput = document.getElementById('password-length');
    const includeUppercaseCheckbox = document.getElementById('include-uppercase');
    const includeLowercaseCheckbox = document.getElementById('include-lowercase');
    const includeNumbersCheckbox = document.getElementById('include-numbers');
    const includeSpecialCheckbox = document.getElementById('include-special');
    const generateBtn = document.getElementById('generate-btn');
    const generatedPasswordInput = document.getElementById('generated-password');
    const copyBtn = document.getElementById('copy-btn');
    const messageDisplay = document.getElementById('message');

    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const specialChars = '!@#$%^&*()_-+=[]{};:,.<>?';

    generateBtn.addEventListener('click', generatePassword);
    copyBtn.addEventListener('click', copyToClipboard);

    // Initial generation on page load for a default password
    generatePassword();

    function generatePassword() {
        const length = parseInt(passwordLengthInput.value);
        const includeUppercase = includeUppercaseCheckbox.checked;
        const includeLowercase = includeLowercaseCheckbox.checked;
        const includeNumbers = includeNumbersCheckbox.checked;
        const includeSpecial = includeSpecialCheckbox.checked;

        let availableChars = '';
        let generatedPassword = '';
        let guaranteedChars = []; // To ensure at least one of each selected type is included

        if (includeUppercase) {
            availableChars += uppercaseChars;
            guaranteedChars.push(getRandomChar(uppercaseChars));
        }
        if (includeLowercase) {
            availableChars += lowercaseChars;
            guaranteedChars.push(getRandomChar(lowercaseChars));
        }
        if (includeNumbers) {
            availableChars += numberChars;
            guaranteedChars.push(getRandomChar(numberChars));
        }
        if (includeSpecial) {
            availableChars += specialChars;
            guaranteedChars.push(getRandomChar(specialChars));
        }

        if (availableChars === '') {
            showMessage('Please select at least one character type!', 'error');
            generatedPasswordInput.value = '';
            return;
        }
        if (length < guaranteedChars.length) {
            showMessage(`Password length must be at least ${guaranteedChars.length} for selected options.`, 'error');
            generatedPasswordInput.value = '';
            return;
        }

        // Add guaranteed characters first
        generatedPassword = guaranteedChars.join('');

        // Fill the rest of the password length with random characters from all selected types
        for (let i = generatedPassword.length; i < length; i++) {
            generatedPassword += getRandomChar(availableChars);
        }

        // Shuffle the generated password to ensure randomness of guaranteed characters' positions
        generatedPassword = shuffleString(generatedPassword);

        generatedPasswordInput.value = generatedPassword;
        showMessage('Password generated!', 'success');
    }

    function getRandomChar(charSet) {
        const randomIndex = Math.floor(Math.random() * charSet.length);
        return charSet[randomIndex];
    }

    function shuffleString(str) {
        const array = str.split('');
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
        return array.join('');
    }

    function copyToClipboard() {
        if (generatedPasswordInput.value) {
            // Use modern Clipboard API if available
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(generatedPasswordInput.value)
                    .then(() => {
                        showMessage('Password copied to clipboard!', 'success');
                    })
                    .catch(err => {
                        console.error('Failed to copy text: ', err);
                        fallbackCopyToClipboard(); // Fallback if modern API fails
                    });
            } else {
                // Fallback for older browsers
                fallbackCopyToClipboard();
            }
        } else {
            showMessage('No password to copy!', 'error');
        }
    }

    function fallbackCopyToClipboard() {
        generatedPasswordInput.select(); // Select the text field
        generatedPasswordInput.setSelectionRange(0, 99999); // For mobile devices
        document.execCommand('copy'); // Copy the text inside the text field
        showMessage('Password copied to clipboard (fallback)!', 'success');
    }

    function showMessage(msg, type) {
        messageDisplay.textContent = msg;
        messageDisplay.className = 'message ' + type; // Set class for styling
        setTimeout(() => {
            messageDisplay.textContent = '';
            messageDisplay.className = 'message';
        }, 3000); // Clear message after 3 seconds
    }

    // Add event listener to checkboxes and length input to regenerate password
    // This provides a more dynamic experience
    passwordLengthInput.addEventListener('input', generatePassword);
    includeUppercaseCheckbox.addEventListener('change', generatePassword);
    includeLowercaseCheckbox.addEventListener('change', generatePassword);
    includeNumbersCheckbox.addEventListener('change', generatePassword);
    includeSpecialCheckbox.addEventListener('change', generatePassword);
});
