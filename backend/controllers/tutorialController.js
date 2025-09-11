const Tutorial = require('../models/Tutorial');

function extractVideoId(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

exports.addTutorial = async (req, res) => {
  try {
    const { title, description, youtubeUrl, author } = req.body;
    if (!title || !description || !youtubeUrl || !author) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) return res.status(400).json({ success: false, message: 'Invalid YouTube URL' });
    const tutorials = await Tutorial.find({});
    const id = tutorials.length > 0 ? tutorials[tutorials.length - 1].id + 1 : 1;
    const tutorial = new Tutorial({
      id,
      title,
      description,
      youtubeUrl: `https://www.youtube.com/embed/${videoId}`,
      videoId,
      author,
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    });
    await tutorial.save();
    res.json({ success: true, message: 'Tutorial added successfully', tutorial });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAllTutorials = async (_req, res) => {
  try {
    const tutorials = await Tutorial.find({}).sort({ date: -1 });
    res.json({ success: true, tutorials });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getTutorial = async (req, res) => {
  try {
    const tutorialId = parseInt(req.params.id);
    const tutorial = await Tutorial.findOne({ id: tutorialId });
    if (!tutorial) return res.status(404).json({ success: false, message: 'Tutorial not found' });
    tutorial.views += 1;
    await tutorial.save();
    res.json({ success: true, tutorial });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.removeTutorial = async (req, res) => {
  try {
    const tutorialId = req.body.id;
    const deleted = await Tutorial.findOneAndDelete({ id: tutorialId });
    if (!deleted) return res.status(404).json({ success: false, message: 'Tutorial not found' });
    res.json({ success: true, message: 'Tutorial deleted successfully', title: deleted.title });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.searchTutorials = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Search query is required' });
    const tutorials = await Tutorial.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { author: { $regex: q, $options: 'i' } }
      ]
    }).sort({ date: -1 });
    res.json({ success: true, tutorials, count: tutorials.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


