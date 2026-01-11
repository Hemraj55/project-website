let display = document.getElementById('display');
let expr = "";

window.input = function(val) {
    if (val === 'pi') {
        expr += Math.PI.toFixed(8);
    } else if (val === '^') {
        expr += '**';
    } else {
        expr += val;
    }
    display.textContent = expr || "0";
}

window.clearDisplay = function() {
    expr = "";
    display.textContent = "0";
}

window.backspace = function() {
    expr = expr.slice(0, -1);
    display.textContent = expr || "0";
}

window.calculate = function() {
    try {
        // Replace sqrt, log, ln with JS equivalents
        let evalExpr = expr
            .replace(/sqrt\(/g, 'Math.sqrt(')
            .replace(/log\(/g, 'Math.log10(')
            .replace(/ln\(/g, 'Math.log(');
        let result = eval(evalExpr);
        display.textContent = result !== undefined ? result : "Error";
        expr = result.toString();
    } catch {
        display.textContent = "Error";
        expr = "";
    }
}

// Theme toggle (works on calculator page)
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
    });
}