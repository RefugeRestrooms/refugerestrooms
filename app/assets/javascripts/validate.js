//= require jquery
//= require jquery_ujs
//= require turbolinks 
//= require_tree .

var userName = document.getElementById('username');                            // Declare and set elements to variables.
var userEmail = document.getElementById('email');
var userMsg = document.getElementById('message');
var valMessageName = document.getElementById('message-name');
var valMessageEmail = document.getElementById('message-email');
var valMessageMsg = document.getElementById('message-msg');

function validationUsername() {                                                // Function for username  validation.
  var name = userName.value;                                                   // Declare a instant variable to hold user name value.  
  if(name.length < 6) {                                                        // Checks if username is smaller than 6 characters.                         
    valMessageName.textContent = "Mininum 6 characters name!";                // If is smaller than 6 show error message.
    valMessageName.className = "failed";                                      // Set failed class.
  }
  else {                                                                      
  	valMessageName.textContent = "Your username is valid.";                           // If username is bigger than 6 show success message.
  	valMessageName.className = "succeed";                                     // Set succeed class.
  }
}

function validationEmail() {                                                // Function for email  validation.
  var email = userEmail.value;                                              // Declare a instant variable to hold email value.
  if(email.length == 0) {                                                 // Checks if email is blank. 
    valMessageEmail.textContent = "Can't leave email blank!";             // If is blank show error message.
    valMessageEmail.className = "failed";                                 // Set failed class.
  }else {
  	valMessageEmail.textContent = "Your email is valid.";                       // If email is not empty show success message.
  	valMessageEmail.className = "succeed";                              // Set succeed class.
  }
}

function validationMessage() {                                                // Function for message  validation.
  var msg = userMessage.value;                                                   // Declare a instant variable to hold user name value.  
  if(msg.length == 0) {                                                        // Checks if message is blank.                         
    valMessageName.textContent = "Can't leave email blank!";                // If is blank show error message.
    valMessageName.className = "failed";                                      // Set failed class.
  }
  else {                                                                      
  	valMessageName.textContent = "Your message is valid.";                    // If is not show success message.
  	valMessageName.className = "succeed";                                     // Set succeed class.
  }
}

userName.addEventListener('blur', validationUsername);           // Set a blur event and validation function to username.
userEmail.addEventListener('blur', validationEmail);             // Set a blur event and validation function to email.
userPass.addEventListener('blur', validationMessage);            // Set a blur event and validation function to message.
