
//logout
router.post('/players/logout', auth, async (req, res) => {
    try {
        req.player.tokens = req.player.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.player.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

//logout from all accounts
router.post('/players/logoutAll', auth, async (req, res) => {
    try {
        req.player.tokens = []
        await req.player.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

//get player profile
router.get('/players/me', auth, async (req, res) => {
    res.send(req.player)
})

//update player profile
router.patch('/players/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => req.player[update] = req.body[update])
        await req.player.save()
        res.send(req.player)
    } catch (e) {
        res.status(400).send(e)
    }
})

//delete player profile
router.delete('/players/me', auth, async (req, res) => {
    try {
        await req.player.remove()
        sendCancelationEmail(req.player.email, req.player.name)
        res.send(req.player)
    } catch (e) {
        res.status(500).send()
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'))
        }

        cb(undefined, true)
    }
})

//upload an avatar
router.post('/players/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.player.avatar = buffer
    await req.player.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/players/me/avatar', auth, async (req, res) => {
    req.player.avatar = undefined
    await req.player.save()
    res.send()
})

//Get avatar
router.get('/players/:id/avatar', async (req, res) => {
    try {
        const player = await Player.findById(req.params.id)

        if (!player || !player.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(player.avatar)
    } catch (e) {
        res.status(404).send()
    }
})