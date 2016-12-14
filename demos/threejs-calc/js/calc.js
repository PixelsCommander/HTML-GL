( function (){

    //***************************SET VARIABLES ***********************************
    //get input buttons, operators, and our display area
    var inputButtons = document.body.getElementsByClassName('bg-gray');
    var operatorButtons = document.body.getElementsByClassName('bg-orange');
    var displayElement = document.querySelector('#display-window');
    var memRecall = document.querySelector('#mem-recall');
    var degRadDisp = document.querySelector('#deg-rad-indicator');
    var swOperator, result, i, j, k, l, firstOperand, lastOperation, dispFlash, passObj;
    var trigInput, trigOutput;
    var displayVal = 0;
    var operator = '';
    var lastOperand = '';
    var test = true;
    var counter = 0;
    var secondOn = false;
    var radianOn = true;
    var inputComplete = false;
    var memVal = 0;
    var parenArray = [];
    var savedOp;
    var butID, flashTemp;
//objects used for mapping keyboard input to application logic
    var keyObj = { 13:"evaluate", 27:"calc-clear", 48: "0", 49: "1", 50: "2", 51: "3", 52: "4", 53: "5", 54: "6", 55: "7", 56: "8", 57: "9", 96: "0", 97: "1", 98: "2", 99: "3", 100: "4", 101: "5", 102: "6", 103: "7", 104: "8", 105: "9", 106: "multiply", 107: "add", 109: "subtract", 110: "calc-decimal", 111: "divide", 187: "evaluate", 190: "calc-decimal", 191: "divide", 189: "subtract" };
    var shiftKeyObj = { 57: "lft-paren", 48: "rht-paren", 53: "percent", 56: "multiply", 104: "multiply", 187: "add" };

//***************DEBUG OUTPUT*************************
//log app state to screen for debugging
    var debugOn = false;
    function doDebug(){
        if(debugOn){
            var debugElement = document.querySelector('#debug-window');
            var debugOutput = '<ul>';
            debugOutput += '<li>firstOperand: '+ firstOperand + '</li>';
            debugOutput += '<li>operator: '+ operator + '</li>';
            debugOutput += '<li>lastOperand: '+ lastOperand + '</li>';
            debugOutput += '<li>lastOperation: '+ lastOperation + '</li>';
            debugOutput += '<li>displayVal: '+ displayVal + '</li>';
            debugOutput += '<li>memVal: '+ memVal + '</li>';
            debugOutput += '<li>swOperator: '+ swOperator + '</li>';
            debugOutput += '<li>inputComplete: '+ inputComplete + '</li>';
            debugOutput += '<li>radianOn: '+ radianOn + '</li>';
            debugOutput += '<li>dispFlash: '+ dispFlash + '</li>';
            console.dir( parenArray );
            debugOutput += '</ul>';
            debugElement.innerHTML = debugOutput;
        }
    }

//***************MATH FUNCTIONS WRITTEN OR COPIED*************************
//used by several log functions to set different log bases
    function getBaseLog(x, y) {
        return Math.log(y) / Math.log(x);
    }

    function factorial(op) {
        // Lanczos Approximation of the Gamma Function
        // As described in Numerical Recipes in C (2nd ed. Cambridge University Press, 1992)
        // copied from stackoverflow ( http://stackoverflow.com/questions/3959211/fast-factorial-function-in-javascript ) - answer by Waleed Amjad
        var factProduct = 1;
        while(op > 0){
            factProduct *= op;
            op --;
        }
        return factProduct;
    }

    function doEE( opOne, opTwo ){
        var output, numDigits;
        output = '';
        if( opOne.indexOf('.') > -1 ){
            //if we already have a decimal in the number
            var decIn = opOne.indexOf('.');
            numDigits = opOne.length - decIn;
            output = opOne.slice(0, 1) + '.' + opOne.slice(1,decIn) + opOne.slice( decIn+1, opOne.length) + 'E' + ( Number(numDigits) + Number(opTwo));
        }else{
            //no decimal present
            numDigits = opOne.length;
            output = opOne.slice(0,1) + '.' + opOne.slice(1, numDigits ) + ' E ' + (Number(numDigits) + Number(opTwo));
        }
        return output;
    }

    function inputTrig(){
        if(radianOn){
            //if radianOn is true, we are actually in degree mode
            //and need to convert values from degrees to radians
            // console.log('converting '+ displayElement.innerHTML + ' degrees into ' + displayElement.innerHTML * Math.PI / 180 + ' radians for computation');
            return displayElement.innerHTML * Math.PI / 180;
        }else{
            //if radianOn is false we are getting our input in radians
            return displayElement.innerHTML;
        }
    }

    function outputTrig( trigVal ){
        if(radianOn){
            //if radianOn is true, we are actually in degree mode
            //and need to convert value back to radian for output
            // console.log('converting '+ trigVal + ' radians into ' + trigVal / ( Math.PI / 180 ) + ' degrees for output');
            return trigVal * ( 180 / Math.PI );
        }else{
            //if radianOn is false we are getting our input in radians
            return trigVal;
        }
    }
//***************HANDLES THE UPDATING OF DISPLAY WINDOW*************************
    function outputToDisplay ( outputStr ) {

        //if we are getting an input that is too long, just reset
        if( outputStr.length > 15 ){
            displayVal = outputStr.slice(0, 15);
            displayElement.style.fontSize = '55px';
            displayElement.innerHTML = displayVal;
        } else {
            //set display with new value
            displayElement.innerHTML = outputStr;
            //check with DOM to find what font-size our window is set to by main.css
            if(displayElement.style.fontSize === ''){
                displayElement.style.fontSize = window.getComputedStyle( displayElement ).fontSize;
            }
            //reset window to full size on update
            var fontSize = 55;
            displayElement.style.fontSize = '55px';
            //if window is too large, shrink font size until our output fits (min font size set to 12px)
            while (displayElement.offsetWidth > 215 && fontSize >= 12 ) {
                fontSize = (Number(fontSize)- 1);
                displayElement.style.fontSize = (fontSize + 'px');
            }
        }

        if (window.elementToAddToScene) {
            window.elementToAddToScene.GLElement.update('texture');
        }
    }
//***********************CLEAR BUTTON IMPLEMENTATION *************************
//if we hit the clear button reset our variables and display
    function clearCalc( setDisplay ){
        displayVal = setDisplay;
        firstOperand = '';
        lastOperand = '';
        lastOperation = '';
        operator = '';
        swOperator = '';
        displayElement.style.fontSize = '55px';
        document.querySelector('#calc-clear').innerHTML = 'AC';
    }
//********************* +/- BUTTON INPUT  **********************************
//change the value of our displayVal from pos to neg (or vice-versa)
    function plusMinus(){
        if( displayVal != '0'){
            if( displayVal.slice(0,1) == '-'){
                displayVal = displayVal.slice(1, displayVal.length);
            }else{
                displayVal = '-' + displayVal;
            }
        }
    }
//******************PERCENT BUTTON INPUT STAGING*****************************
//logic here passes current decimal location to moveDec function
//if no decimal is set, we put it at the far right of what we have
    function percentMoveDec(){
        var decIndex = displayVal.indexOf('.');
        if( decIndex > -1 ){
            //decimal point set already move right 2 places
            displayVal = moveDec ( decIndex );
        }else {
            //no decimal set, move from right side 2 places
            displayVal += '.';
            displayVal = moveDec( displayVal.length-1 );
        }
    }
//***********************PERCENT BUTTON IMPLEMENTATION *************************
//function implements the % calculator function, gets passed the index of the
//current decimal location
    function moveDec ( fromIndex ){
        var newStr;
        var strEnd;
        //check if we need to prepend a '0.'  or '0.0'
        if(fromIndex < 3){
            newStr = '0.';
            if( fromIndex == 1){
                newStr = newStr + '0';
            }
            //check if there are digits behind the decimal to keep
            if( fromIndex < displayVal.length -1 ){
                strEnd = displayVal.slice(fromIndex+1, displayVal.length);
                newStr = newStr + displayVal.slice(0, fromIndex) + strEnd;
            }else{
                newStr = newStr + displayVal.slice(0, fromIndex);
            }
        }else{
            //move decimal two place to the right
            var strBefore = displayVal.slice(0, fromIndex-2);
            var strAfter = displayVal.slice( fromIndex-2, fromIndex );
            if( fromIndex < displayVal.length -1 ){
                strEnd = displayVal.slice(fromIndex+1, displayVal.length);
                newStr = strBefore + '.' + strAfter + strEnd;
            }else{
                newStr = strBefore + '.' + strAfter;
            }
        }
        return newStr;
    }

//***********************CLOSE PARENTHESIS FUNCTION*****************************
//processes operation or lack thereof baesd on condition of the parenArray stack
//and the current firstOperand and operation setting
    function closeParen(){
        if(parenArray.length > 0){
            //we have items on the stack so
            //check status of firstOperand and operation variables
            lastOperand = displayVal;
            swOperator = operator;
            switchOperator(operator);
            savedOp = parenArray.pop();
            firstOperand = savedOp.firstOperand;
            operator = savedOp.operator;
            lastOperand = '';
            lastOperation = '';
            dispFlash = true;
            doDebug();
            setTimeout(flashDisp, 10);
        }else{
            //stack is not currently set just flash current screen display
            flashTemp = displayElement.innerHTML;
            displayElement.innerHTML = '';
            setTimeout(flashDispPlain, 10);
        }
    }


//***********************SECOND FUNCTION BUTTON IMPLEMENTATION *************************
//function toggles several buttons to the alternate function they offer
    function secondToggle(){
        var firsts = document.getElementsByClassName('first-function');
        var seconds = document.getElementsByClassName('second-function');
        // console.dir( firsts );
        // console.dir( seconds );
        if(secondOn){
            secondOn = false;
            for( j=0; j < firsts.length; j++ ){
                firsts[j].style.display = 'block';
                seconds[j].style.display = 'none';
            }
        }else{
            secondOn = true;
            for( j=0; j < firsts.length; j++ ){
                firsts[j].style.display = 'none';
                seconds[j].style.display = 'block';
            }
        }
    }

//***********************RADIAN / DEGREE BUTTON IMPLEMENTATION *************************
//toggles the setting of trig functions from doing calculation based on degrees or radian
    function radianDegreeToggle(){
        var radianBtn = document.querySelector('#calc-radian');
        var degreeBtn = document.querySelector('#calc-degrees');
        if(radianOn){
            radianOn = false;
            radianBtn.style.display = 'none';
            degreeBtn.style.display = 'block';
            degRadDisp.innerHTML = 'Radian';
        }else{
            radianOn = true;
            radianBtn.style.display = 'block';
            degreeBtn.style.display = 'none';
            degRadDisp.innerHTML = 'Degree';
        }
    }


//***********************INPUT BUTTON PROCESSOR*********************************
//function takes an Object as input with attributes classList and id at a minimum
//Object passed in by click Event Handler is auto filled
//Object passed by keyup Event Handler is built by sortKey and buildObj functions
    function processInput( inputObj ){
        //set variable to check on
        butID = inputObj.id;
        //*************NUMBER BUTTON INPUT**************************
        //check if we have hit a number key
        for( j=0; j < inputObj.classList.length; j++ ){
            if( inputObj.classList[j] == 'calc-num'){
                if (inputComplete){
                    // lastOperand = displayElement.innerHTML;
                    displayVal = '';
                    inputComplete = false;
                }
                document.querySelector('#calc-clear').innerHTML = 'C';
                if( displayVal == '0'){
                    displayVal = inputObj.innerHTML;
                } else {
                    displayVal += inputObj.innerHTML;
                }
            }
        }

        switch (butID) {
            case 'calc-clear':
                clearCalc('0');
                break;
            case 'plus-minus':
                plusMinus();
                break;
            case 'percent':
                percentMoveDec();
                break;
            case 'calc-decimal':
                //************* DECIMAL BUTTON INPUT  *****************************
                //add a decimal point or not depending on existing content
                if( displayVal.indexOf('.') == -1 ){
                    displayVal = displayVal + '.';
                }
                break;
            case 'lft-paren':
                //handle left parenthesis
                parenArray.push({'firstOperand':firstOperand, 'operator':operator});
                firstOperand = 0;
                operator = '';
                inputComplete = true;
                dispFlash = true;
                displayVal = displayElement.innerHTML;
                break;
            case 'rht-paren':
                //handle right parenthesis
                closeParen();
                break;
            case 'mem-clear':
                //handle memory clear
                memVal = 0;
                clearMRBorder();
                break;
            case 'mem-add':
                //add displayVal to memVal
                memVal += Number(displayVal);
                inputComplete = true;
                addMRBorder();
                break;
            case 'mem-subtract':
                //subtract displayVal from memVal
                memVal -= Number(displayVal);
                inputComplete = true;
                addMRBorder();
                break;
            case 'mem-recall':
                //displayVal = memVal and update
                displayVal = memVal;
                inputComplete = true;
                break;
            case 'second-func':
                //toggle function buttons that have 2nd options feature
                secondToggle();
                break;
            case 'calc-squared':
                //dispVal squared
                displayVal = Math.pow(displayElement.innerHTML, 2);
                inputComplete = true;
                break;
            case 'calc-cubed':
                //dispVal cubed
                displayVal = Math.pow(displayElement.innerHTML, 3);
                inputComplete = true;
                break;
            case 'calc-xtoy':
                //dispVal to the y power
                processOperator(inputObj);
                break;
            case 'calc-etox':
                //e to the x power
                displayVal = Math.pow(Math.E  , displayElement.innerHTML);
                inputComplete = true;
                break;
            case 'calc-ytox':
                //takes the second input and makes it the base, first input the exponent
                processOperator(inputObj);
                break;
            case 'calc-tentox':
                //ten to the x power
                displayVal = Math.pow( 10  , displayElement.innerHTML);
                inputComplete = true;
                break;
            case 'calc-twotox':
                //two to the x power
                displayVal = Math.pow( 2  , displayElement.innerHTML);
                inputComplete = true;
                break;
            case 'calc-inverse':
                //value of 1 divided by dispVal
                displayVal = 1 / displayElement.innerHTML;
                inputComplete = true;
                break;
            case 'calc-sqrt':
                //disVal square root
                displayVal = Math.sqrt(displayElement.innerHTML);
                inputComplete = true;
                break;
            case 'calc-cube-root':
                //dispVal cube root
                displayVal = Math.cbrt(displayElement.innerHTML);
                inputComplete = true;
                break;
            case 'calc-xroot':
                //dispVal x power root
                processOperator(inputObj);
                break;
            case 'calc-ln':
                //natural log
                displayVal = Math.log(displayElement.innerHTML);
                inputComplete = true;
                break;
            case 'calc-logy':
                //regular logarithm
                processOperator(inputObj);
                break;
            case 'calc-logten':
                //log base 10
                displayVal = getBaseLog( 10, displayElement.innerHTML);
                inputComplete = true;
                break;
            case 'calc-logtwo':
                //log base 2
                displayVal = getBaseLog( 2, displayElement.innerHTML);
                inputComplete = true;
                break;
            case 'calc-factorial':
                //factorial of input value
                if( (Number(displayElement.innerHTML) <= 75) ){
                    displayVal = factorial( displayElement.innerHTML );
                }else{
                    clearCalc('Overflow');
                }
                inputComplete = true;
                break;
            case 'calc-sin':
                //sine function
                trig = inputTrig();
                displayVal = Math.sin(trig);
                inputComplete = true;
                break;
            case 'calc-arcsin':
                //arcsin
                trig = inputTrig();
                displayVal = Math.asin(trig);
                inputComplete = true;
                break;
            case 'calc-cos':
                //cosine
                trig = inputTrig();
                displayVal = Math.cos(trig);
                inputComplete = true;
                break;
            case 'calc-arccos':
                //arccos
                trig = inputTrig();
                displayVal = Math.acos(trig);
                inputComplete = true;
                break;
            case 'calc-tan':
                //tangent
                trig = inputTrig();
                displayVal = Math.tan(trig);
                inputComplete = true;
                break;
            case 'calc-arctan':
                //arctan
                trig = inputTrig();
                displayVal = Math.atan(trig);
                inputComplete = true;
                break;
            case 'const-e':
                //Euler's number
                displayVal = Math.E;
                inputComplete = true;
                break;
            case 'calc-enter-exponent':
                //do EE operation
                processOperator(inputObj);
                break;
            case 'calc-radian':
                //toggle radian and degree input / output for trig functions
                radianDegreeToggle();
                break;
            case 'calc-degrees':
                //toggle radian and degree input / output for trig functions
                radianDegreeToggle();
                break;
            case 'calc-sinh':
                //hyperbolic sine
                trig = inputTrig();
                displayVal = Math.sinh(trig);
                inputComplete = true;
                break;
            case 'calc-arcsinh':
                //hyperbolic arcsin
                trig = inputTrig();
                displayVal = Math.asinh(trig);
                inputComplete = true;
                break;
            case 'calc-cosh':
                //hyperbolic cosine
                trig = inputTrig();
                displayVal = Math.cosh(trig);
                inputComplete = true;
                break;
            case 'calc-arccosh':
                //hyperbolic arccos
                trig = inputTrig();
                displayVal = Math.acosh(trig);
                inputComplete = true;
                break;
            case 'calc-tanh':
                //hyperbolic tan
                trig = inputTrig();
                displayVal = Math.tanh(trig);
                inputComplete = true;
                break;
            case 'calc-arctanh':
                //hyperbolic arctan
                trig = inputTrig();
                displayVal = Math.atanh(trig);
                inputComplete = true;
                break;
            case 'const-pi':
                //pi
                displayVal = Math.PI;
                inputComplete = true;
                break;
            case 'calc-random':
                //random number between 0 and 1
                displayVal = Math.random();
                inputComplete = true;
                break;
            default:
        }
        outputToDisplay ( displayVal );
        doDebug();
    }


//**********************OPERATOR BUTTON PROCESSOR*******************************
//function takes an Object as input with attribute  id at a minimum
//Object passed in by click Event Handler is auto filled
//Object passed by keyup Event Handler is built by sortKey and buildObj functions
    function processOperator( operatorObj ){
        // on operator input we flash the displayVal for 10 miliseconds to give a
        // visual reference to the user (per Apple Calc functionality)
        // -- see setTimeout at end of each part here
        inputComplete = true;
        outputToDisplay( '' );
        //check if we need to evaluate the current expression or set operation
        if( operatorObj.id != 'evaluate' && operator === '' ){
            //save the operation to do and save the first operand value
            // console.log('inside set operator');
            operator = operatorObj.id;
            firstOperand = displayVal;
            dispFlash = false;
            lastOperand = '';
            doDebug();
            setTimeout(flashDisp, 10);
        } else if( operatorObj.id !== 'evaluate'){
            //evaluating on second operator input
            // console.log('inside eval on operator input');
            lastOperand = displayVal;
            swOperator = operator;
            switchOperator();
            operator = operator;
            firstOperand = displayVal;
            lastOperand = '';
            lastOperation = operator;
            dispFlash = true;
            doDebug();
            setTimeout(flashDisp, 10);
        } else {
            //execute the operation
            // console.log('inside eval on equals input');
            //set lastOperand to use if we get evaluated again after this, but only if
            // it is currently not set (otherwise we might be on the 2nd run already!)
            if(firstOperand === ''){
                firstOperand = displayVal;
            }
            if(lastOperand === ''){
                lastOperand = displayVal;
            }
            //set our variable to use in the switch statement, if operator is set, we
            //use that, if operator is not set (we just performed an operation and
            // are doing another evaluation immediately), then we switch on the lastOperation
            if(operator !== '' ){
                swOperator = operator;
            }else if (lastOperation !== '') {
                swOperator = lastOperation;
            }
            // debugging code
            // console.log('firstOperand is: ', firstOperand);
            // console.log('operator is: ', operator);
            // console.log('displayVal is: ', displayVal);
            // console.log('swOperator is: ', swOperator);
            // console.log('lastOperand is: ', lastOperand);
            switchOperator();
            // console.log('result of the operation is: ', displayVal);
            // reset variables for use in next operation(s)
            //new operand is result of this operation
            // firstOperand = displayVal;
            firstOperand = '';
            //save the operation we did (in case we need it on another immediate eval)
            lastOperation = operator;
            operator = '';
            //pass logic to flashDisp()
            dispFlash = true;
            doDebug();
            setTimeout(flashDisp, 10);
        }
    }
//*************************** switch Operators *********************************
//handler that finishes display output after setTimeout flashes display window
//on operator input
    function switchOperator(){
        switch(swOperator) {
            case 'divide':
                displayVal = Number(firstOperand) / Number(lastOperand);
                break;
            case 'multiply':
                displayVal = Number(firstOperand) * Number(lastOperand);
                break;
            case 'subtract':
                displayVal = Number(firstOperand) - Number(lastOperand);
                break;
            case 'add':
                displayVal = Number(firstOperand) + Number(lastOperand);
                break;
            case 'calc-xtoy':
                //firstOperand to the lastOperand power
                displayVal = Math.pow(Number(firstOperand), Number(lastOperand));
                break;
            case 'calc-ytox':
                //takes the second input and makes it the base, first input the exponent
                displayVal = Math.pow(Number(lastOperand), Number(firstOperand));
                break;
            case 'calc-xroot':
                //dispVal x power root
                displayVal = Math.pow( Number(firstOperand), (1 / Number(lastOperand)) );
                break;
            case 'calc-logy':
                //regular logarithm
                displayVal = getBaseLog(lastOperand, firstOperand);
                break;
            case 'calc-enter-exponent':
                //do EE operation
                displayVal = doEE(firstOperand, lastOperand);
                break;
            case 'rht-paren':
                //do EE operation
                displayVal = closeParen();
                break;
        }
        displayVal = String( displayVal );
    }


//*************************** flashDisp ****************************************
//handler that finishes display output after setTimeout flashes display window
//on operator input

    function flashDisp () {
        if( dispFlash ){
            outputToDisplay ( displayVal );
            dispFlash = false;
        }else{
            outputToDisplay ( displayVal );
            displayVal = '0';
        }
    }

//*************************** flashDispPlain ***********************************
//handler that flashes the display with no changes to the state of the apply
    function flashDispPlain(){
        displayElement.innerHTML = flashTemp;
    }

//********************MOUSE INPUT PASS THROUGH FUNCTIONS ***********************
//handler functions that pass click event object to processor functions, this
//lets us use the same processor function to handle keyboard or mouse input
    function collectOperator(){
        processOperator(this);
    }
    function collectInput(){
        processInput(this);
    }
//********************KEYBOARD INPUT PROCESSOR FUNCTIONS ***********************
//***********************       buildObj           *****************************
//builds an object with the correct parameters to match the DOM Element that
//corresponds to the key inputted, this lets us use the same function to process
//input from either source
    function buildObj( key ){
        var id, innerHTML;
        var classList = [];
        var tempObj;
        if( ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].indexOf(key) > -1){
            //build attributes based on calc-num selector for inputs function
            classList.push( 'calc-num' );
            tempObj = { 'classList': classList, 'innerHTML':key  };
            processInput(tempObj);
        }else if( ['divide', 'multiply', 'subtract', 'add', 'evaluate'].indexOf(key) > -1){
            //send to operator function
            tempObj = {'id': key };
            processOperator(tempObj);
        }else if( ['percent', 'calc-decimal', 'calc-clear'].indexOf(key) > -1 ){
            tempObj = {'id': key, 'classList':''};
            processInput(tempObj);
        }
    }
//***********************       sortKey             ****************************
//event handler for keyboard input, passes value to
//build object to pass to processing functions
    function sortKey( e ){
        if(shiftKeyObj.hasOwnProperty(e.keyCode) > 0  && e.shiftKey === true ){
            // console.log('key code pressed with shift key active : ' + e.keyCode + ' and key was: ' + shiftKeyObj[e.keyCode] );
            buildObj(shiftKeyObj[e.keyCode]);
        }else if (keyObj.hasOwnProperty(e.keyCode) > 0 ){
            // console.log('key code pressed is: ' + e.keyCode + ' and key was: ' + keyObj[e.keyCode] );
            buildObj(keyObj[e.keyCode]);
        }  else {
            // console.log('key code registered: ' + e.keyCode + ' is not one of the keys we care about');
        }
    }

//******************** BUTTON CLICK STYLE FUNCTIONS ****************************
//these just change button styles during the mouseclick
//
// !!!!!  FUTURE UPDATE - ADD EVENT HANDLER AND FUNCTIONS
// !!!!!  TO CHANGE STYLES ON KEYDOWN & KEYUP
    function changeDownBG( e ) {
        e.preventDefault();
        this.style.transform = 'translateZ(0.1px)';
    }
    function changeUpBG(){
        this.style.transform = 'translateZ(0px)';
    }

    function addMRBorder(){
        // memRecall.style.border= '2px solid #8E8E8E';
        memRecall.style.boxShadow= 'inset 0 0 0 2px #8E8E8E';
    }
    function clearMRBorder(){
        memRecall.style.boxShadow= '';
    }
//------------------------------------------------------------------------------
//                              ADD EVENT LISTENERS
//------------------------------------------------------------------------------

//***********************listeners for input buttons****************************
    for (i=0; i<inputButtons.length; i++){
        inputButtons[i].addEventListener( 'click', collectInput );
        inputButtons[i].addEventListener( 'mousedown', changeDownBG );
        inputButtons[i].addEventListener( 'mouseup', changeUpBG );
        inputButtons[i].addEventListener( 'mouseleave', changeUpBG );
    }

//***********************listeners for operator buttons*************************
    for ( i=0; i<operatorButtons.length; i++ ) {
        operatorButtons[i].addEventListener('click', collectOperator );
        operatorButtons[i].addEventListener( 'mousedown', changeDownBG );
        operatorButtons[i].addEventListener( 'mouseup', changeUpBG );
        operatorButtons[i].addEventListener( 'mouseleave', changeUpBG );
    }
//***********************listener for keyboard input****************************
    window.addEventListener( 'keyup', sortKey );
}());
