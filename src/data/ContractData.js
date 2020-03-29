const Contract = require('../models/contract')

const getContractByContractId = async (contractId) => {
  return await Contract.findById(contractId)
}

const getContractsByPlayerId = async (playerId) => {
  return await Contract.find({ 'player_id': playerId })
}

const getContractsByOpponentId = async (opponentId) => {
  return await Contract.find({ 'opponent_id': opponentId })
}

const getContractsByPlayerOrOpponentId = async (Id) => {
  return await Contract.find({ $or: [{ playerId: Id }, { opponentId: Id }] })
}

const deleteContractsByPlayerOrOpponentId = async (Id) => {
  try {
    await Contract.deleteMany({ $or: [{ playerId: Id }, { opponentId: Id }] })
    return ({ status: 200, data: 'All Contracts deleted successfully' })
  } catch (e) {
    return ({ status: 400, data: e })
  }
}

const registerContract = async (contract, playerId) => {
  const requiredFields = ['rules', 'datetime', 'school', 'referee']
  try {
    let newContract = new Contract({
      rules: contract.rules,
      datetime: (Date.parse(contract.datetime)) / 1000,
      school: contract.school,
      comments: contract.comments,
      playerId,
      opponentId: contract.opponentId,
      referee: contract.referee
    })
    let result = await newContract.save()
    return ({ status: 200, data: result })
  } catch (e) {
    let errArray = requiredFields.map((field) => {
      if (e.errors[field] != undefined) {
        return e.errors[field].path
      }
    }).filter((path) => {
      return path != undefined
    })
    return ({ status: 400, data: 'Missing fields: ' + errArray })
  }
}

module.exports = {
  registerContract,
  getContractsByOpponentId,
  getContractsByPlayerId,
  getContractsByPlayerOrOpponentId,
  deleteContractsByPlayerOrOpponentId
}