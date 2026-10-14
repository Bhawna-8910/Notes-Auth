const Note = require('../models/Note');

//GET /api/notes
exports.getNotes = async(req, res, next) => {
    try{
        const notes = await Note.find({user : req.user.id}).sort({createdAt : -1});
        res.status(200).json({
            success : true,
            count : notes.length,
            data : notes
        });
    } catch(error){
        next(error);
    }
};

//POST /api/notes
exports.createNote = async(req, res, next) => {
    try{
        const {title, content} = req.body;
        const note = await Note.create({
            title,
            content,
            user : req.user.id
        });
        res.status(201).json({success : true, data : note});
    } catch (err){
        next(err);
    }
};

//PUT /api/notes/:id
exports.updateNote = async (req, res, next) => {
    try {
        const note = await Note.findOneAndUpdate(
            {_id : req.params.id, user : req.user.id}, // enforce ownership
            req.body,
            {new : true, runValidators : true}
        );

        if(!note){
            return res.status(404).json({
                success : false,
                message : 'Note not found or unauthorized'
            });
        }
        res.status(200).json({success:true, data: note});
    } catch(err){
        next(err);
    }
};

//DELETE /api/notes/:id
exports.deleteNote = async (req, res, next) => {
    try{
        const note = await Note.findOneAndDelete({
            _id : req.params.id,
            user: req.user.id
        });

        if(!note){
            return res.status(404).json({
                success : false,
                message : 'Note not found or unauthorized'
            });
        }
        res.status(200).json({success : true, message : 'Note deleted'});
    } catch(err){
        next(err);
    }
};