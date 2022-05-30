module.exports = {
  purge: ['./public/index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontSize: {
        '122px': '122px',
        '88px': '88px',
        '55px': '55px',
        '48px': '48px',
        '36px': '36px',
        '24px': '24px',
        '21px': '21px',
        '15px': '15px'
      },
      width: {
        '1342px': '1342px',
        '1024px': '1024px',
        '155px': '155px',
        '100px': '100px',
        '48%': '48%'
      },
      height: {
        '310px': '310px',
        '250px': '250px',
        '155px': '155px',
        '100px': '100px'
      },
      colors: {
        permaGreen: '#5D8F4B',
        permaGrey: 'rgba(233, 233, 233, 0.5)'
      }
    }
  },
  variants: {
    extend: {
      borderWidth: ['last'],
      padding: ['last'],
      margin: ['last'],
      width: ['last']
    }
  },
  plugins: []
}
