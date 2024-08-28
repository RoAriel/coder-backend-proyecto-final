import bcrypt from 'bcrypt'

export const generaHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10))

export const validaPasword = (password, passwordHash) => bcrypt.compareSync(password, passwordHash);