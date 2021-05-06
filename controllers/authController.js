const User = require ('../model/User');
const jwt = require ('jsonwebtoken');




// handle errors
const handleErrors = (err) => {

    let errors = { email: '', password: ''};

// incorrect email
if (err.message === 'incorrect email') {
    errors.email = 'Email is not registered';
}

// incorrect password 
if (err.message === 'incorrect password') {
    errors.password = 'Incorrect password';
}


 // duplicate error code
 if (err.code === 11000) {
     errors.email = 'Email already registered';
     return errors;
 }

 // validation errors 
 if (err.message.includes('user validation failed')) {
    Object.values(err.errors).forEach(({properties}) => {
        errors[properties.path] = properties.message;
    });
 }   
    return errors;

}
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, 'the secreat of me', {
        expiresIn: maxAge
    });
}

singup_get = (req, res) => {
    res.render("signup");
}


login_get = (req, res) => {
    res.render("login");
}


singup_post = async (req, res) => {
    const { email, password } = req.body;
    
    try {
     const user = await User.create({ email, password });    
     const token = createToken(user._id);
     res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
     res.status(201).json({ user: user._id});
     
    }
    catch (err) {
        const errors = handleErrors(err);
       res.status(400).json({ errors });
    }


}


login_post = async (req, res) => {
    const { email, password } = req.body;

    try {
       const user = await User.login(email, password);
       const token = createToken(user._id);
       res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
       res.status(200).json({ user: user._id });
    }
    catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }

}

logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
}


module.exports = {
    singup_get,
    singup_post,
    login_get,
    login_post,
    logout_get,
}