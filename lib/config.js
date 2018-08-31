const env = 'production';
module.exports = {
    DOMAIN:"http://yg.jd.com"+(env==='production'?'':':8081')
}
