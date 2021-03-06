
const express = require('express')
const AdminService = require('../../services/admin')

const router = new express.Router()

router.get('/api/admin/contracts/:date', async (req, res, next) => {
  const contracts = await AdminService.getAllContractsByDate(req.params.date)
  res.status(200).json({ contracts })
})

router.post('/api/admin/contracts/update/:contractId', async (req, res, next) => {
  const contract = await AdminService.updateContractByContractId(req.params.contractId, req.body)
  res.status(200).json({ contract })
})


module.exports = router