

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


router.post('/login',  async (req, res) => {
    
    try {
        const player = await Player.findByCredentials(req.body.email, req.body.password)
        const token = await player.generateAuthToken()
        //res.send({ player, token }) 
        res.render('player-profile', {
            id: player._id,
            first: player.firstName,
            last: player.lastName,
            school: player.school,
            gi: player.gi,
            nogi: player.nogi,
            weight: player.weight
        })
    } catch (e) {
        res.redirect('/login')
    }
})

// Aternate login routes
router.post('/login', async (req, res, next) => {

    passport.authenticate('local', {
        successRedirect: '/', 
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
    //const player = await Player.findByCredentials(req.body.email, req.body.password)
    // Player.findByCredentials(req.body.email, req.body.password).then((player) => {
    //     res.redirect('/players/' + player._id)
    // }).catch((error) => {
    //     req.flash('error', 'Failed login')
    //     res.render('login.hbs', {
    //         title: 'Login to Your Profile'
    //     })
    // })
});

// router.get('/contracts', ensureAuthenticated, async (req, res) => {
//     const match = {}
//     const sort = {}

//     if (req.query.completed) {
//         match.completed = req.query.completed === 'true'
//     }

//     if (req.query.sortBy) {
//         const parts = req.query.sortBy.split(':')
//         sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
//     }

//     try {
//         await req.player.populate({
//             path: 'contracts',
//             match,
//             options: {
//                 limit: parseInt(req.query.limit),
//                 skip: parseInt(req.query.skip),
//                 sort
//             }
//         }).execPopulate()
//         res.send(req.player.contracts)
//     } catch (e) {
//         res.status(500).send()
//     }
// })


router.get('/contracts', ensureAuthenticated, async (req, res) => {
    const contracts = await Contract.find({ $or:[{ playerId: req.user.id },{ opponentId: req.user.id }] })
        
    let challenges = await Promise.all(contracts.map(async (contract) =>{
        ['rating', 'record', 'birthDate','email','password'].forEach(function (key) {
            delete contract[key];
            });
        if (req.user.id == contract.opponentId){
            return await Player.findById(contract.playerId)
            }
      })).then(value => {return value})
      let incoming = await Promise.all(contracts.map(async (contract) =>{
        ['rating', 'record', 'birthDate','email','password'].forEach(function (key) {
            delete contract[key];
            });
        if (!(req.user.id == contract.opponentId)){
            return await Player.findById(contract.opponentId)
            }
      })).then(value => {return value})
      console.log(incoming)

    //const separated = await Promise.all(separate).then(value => {return value})
    
    res.render('pending-contracts.hbs', {incoming, outgoing} )
})