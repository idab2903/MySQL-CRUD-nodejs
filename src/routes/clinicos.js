const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

//subir imagenes con multer
var storage = multer.diskStorage({
    destination: path.join(__dirname, '../public/uploads'),
    filename:  (req, file, cb) => {
        cb(null, file.originalname);
    }
})

 var upload = multer({
     storage,
  }).single('image');

// continuacion
router.get('/add', (req, res) => {
    res.render('clinicos/add');
});

router.post('/add', upload , async (req, res) => {
    const { title, description, image } = req.body;
    const newClinico = {
        title,
    
        description,
        image:req.file.filename,
        user_id: req.user.id
    };
    console.log(req.file); //multer
    await pool.query('INSERT INTO contenido set ?', [newClinico]);
    req.flash('success', 'Archivo guardado correctamente.');
    res.redirect('/clinicos');
});

router.get('/', isLoggedIn, async (req, res) => {
    const Clinicos = await pool.query('SELECT * FROM contenido WHERE user_id = ?', [req.user.id]);
    res.render('clinicos/list', { Clinicos });
});

router.get('/delete/:id', upload, async (req, res) => {
    const { id } = req.params;
    await pool.query('DELETE FROM contenido WHERE ID = ?', [id]);
    req.flash('success', 'Archivo correctamente eliminado.');
    res.redirect('/clinicos');
});

router.get('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const Clinico = await pool.query('SELECT * FROM contenido WHERE id = ?', [id]);
    console.log(Clinico);
    res.render('clinicos/edit', {Clinico: Clinico[0]});
});

router.post('/edit/:id', upload ,async (req, res) => {
    const { id } = req.params;
    const { title, description, image} = req.body; 

    const newClinico = {
        title,
        description,

        image
    };
    await pool.query('UPDATE contenido set ? WHERE id = ?', [newClinico, id]);
    req.flash('success', 'Archivo editado correctamente.');
    res.redirect('/clinicos');
});

module.exports = router;