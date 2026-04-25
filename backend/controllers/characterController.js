const Character = require('../models/Character');

// CREATE
exports.createCharacter = async (req, res) => {
  try {
    const { name, avatarStyle, favoriteColor } = req.body;
    const character = new Character({
      userId: req.user.id,
      name,
      avatarStyle,
      favoriteColor
    });
    await character.save();
    res.status(201).json(character);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ ALL (For specific user)
exports.getCharacters = async (req, res) => {
  try {
    const characters = await Character.find({ userId: req.user.id });
    res.json(characters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ ONE
exports.getCharacterById = async (req, res) => {
  try {
    const character = await Character.findOne({ _id: req.params.id, userId: req.user.id });
    if (!character) return res.status(404).json({ message: 'Personagem não encontrado' });
    res.json(character);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
exports.updateCharacter = async (req, res) => {
  try {
    const { name, avatarStyle, favoriteColor } = req.body;
    let character = await Character.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!character) return res.status(404).json({ message: 'Personagem não encontrado' });

    character.name = name || character.name;
    character.avatarStyle = avatarStyle || character.avatarStyle;
    character.favoriteColor = favoriteColor || character.favoriteColor;

    await character.save();
    res.json(character);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE
exports.deleteCharacter = async (req, res) => {
  try {
    const character = await Character.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!character) return res.status(404).json({ message: 'Personagem não encontrado' });
    res.json({ message: 'Personagem removido com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE SCORE (Save logic)
exports.updateCharacterScore = async (req, res) => {
  try {
    const { score, level } = req.body;
    let character = await Character.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!character) return res.status(404).json({ message: 'Personagem não encontrado' });

    character.score = score;
    character.level = level;

    await character.save();
    res.json(character);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
