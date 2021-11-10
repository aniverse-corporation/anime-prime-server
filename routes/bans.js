import { Router } from '@awaitjs/express';
import User from '../models/User.js';
import Ban from '../models/Ban.js';
import * as schemes from '@aniverse/utils/validations/index.js';
import validate from '../middlewares/validation.js';
import { hasPermissions } from '../middlewares/auth.js';

const router = Router();

router.getAsync('/', async (req, res) => {
    const bans = await Ban.find().populate('user');
    res.header('Content-Range', 'users 0-24/319');
    res.status(200).json(bans);
});

router.getAsync('/:banId', async (req, res) => {
    const ban = await Ban.findById(req.params.banId).populate("user");
    res.status(200).json(ban);
});

router.postAsync('/', hasPermissions('bans'), validate(schemes.banScheme), async (req, res) => {
    const userExist = await User.findOne({username: req.body.username});

    if(!userExist) {
        return res.status(400).send('User not exist');
    }
    const banExist = await Ban.findOne({user: userExist._id});
    console.log(banExist)
    console.log({user: userExist._id})

    if(banExist) {
        return res.status(400).send('Ban is already exist');
    }
    const ban = new Ban({
        user: userExist._id,
        expire: req.body.expire,
        reason: req.body.reason,
    });
    const savedBan = await ban.save();
    savedBan.user = userExist;
    res.status(200).json(savedBan);
});

router.putAsync('/:banId', hasPermissions('bans'), validate(schemes.banScheme), async (req, res) => {
    const ban = await Ban.findByIdAndUpdate(req.params.banId, req.body, {new: true}).populate("user");
    res.status(200).json(ban);
});

router.deleteAsync('/:banId', hasPermissions('bans'), async (req, res) => {
    const ban = await Ban.findByIdAndRemove(req.params.banId);
    res.status(200).json(ban);
});

export default router;