import * as schemes from '@aniverse/utils/validations/index.js';
import { Router } from '@awaitjs/express';
import { hasPermissions } from '../middlewares/auth.js';
import validate from '../middlewares/validation.js';
import User from '../models/User.js';

const router = Router();

router.getAsync('/', async (req, res) => {
    const admins = await User.find({role: {$ne: null}});
    res.header('Content-Range', 'users 0-24/319');
    res.status(200).json(admins);
});

router.getAsync('/:userId', async (req, res) => {
    const admin = await User.findById(req.params.userId);
    res.status(200).json(admin);
});

router.postAsync('/:username', hasPermissions('admins'), validate(schemes.usernameScheme), async (req, res) => {
    const role = "מנהל";
    const userExist = await User.findOne({username: req.params.username});
    if(!userExist) {
        return res.status(400).send('User not exist');
    } else if(userExist.role != null) {
        return res.status(400).send('User already an admin');
    }
    const admin = await User.findOneAndUpdate({username: req.params.username}, {role}, {new: true});
    res.status(200).json(admin);
});

router.putAsync('/:userId', hasPermissions('admins'), validate(schemes.roleAndPermissionsUpdateScheme), async (req, res) => {
    const admin = await User.findByIdAndUpdate(req.params.userId, req.body, {new: true});
    res.status(200).json(admin);
});

router.deleteAsync('/:userId', hasPermissions('admins'), async (req, res) => {
    const admin = await User.findByIdAndUpdate(req.params.userId, {role: null, permissions: []}, {new: true});
    res.status(200).json(admin);
});

export default router;