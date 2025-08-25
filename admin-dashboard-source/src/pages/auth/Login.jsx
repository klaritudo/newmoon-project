import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  useTheme,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Divider,
  Container,
} from '@mui/material';
import {
  Email,
  Visibility,
  VisibilityOff,
  LockOutlined as LockIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../../features/auth/authSlice';

const Login = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, isAuthenticated, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    // 이미 인증된 사용자는 대시보드로 리다이렉트
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
        backgroundImage: `linear-gradient(145deg, ${theme.palette.primary.main}15, ${theme.palette.background.default})`,
        p: 3,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            width: '100%',
            borderRadius: 2,
            boxShadow: theme.shadows[4],
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              p: 4,
              py: 6,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'white',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: theme.palette.primary.main,
                color: 'white',
                width: 64,
                height: 64,
                borderRadius: '50%',
                mb: 3,
                boxShadow: '0 8px 20px -10px rgba(33, 150, 243, 0.6)',
              }}
            >
              <LockIcon fontSize="large" />
            </Box>
            
            <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
              관리자 로그인
            </Typography>
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              textAlign="center"
              sx={{ mb: 3 }}
            >
              관리자 계정으로 로그인하여 시스템을 관리하세요.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
                {error}
              </Alert>
            )}

            <Box 
              component="form" 
              onSubmit={handleSubmit}
              sx={{ width: '100%', mt: 1 }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="아이디"
                name="username"
                autoComplete="username"
                autoFocus
                value={formData.username}
                onChange={handleChange}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="비밀번호"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={togglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={rememberMe}
                      onChange={handleRememberMeChange}
                      color="primary"
                    />
                  }
                  label="로그인 상태 유지"
                />
                <Typography 
                  variant="body2" 
                  color="primary"
                  sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                >
                  비밀번호 찾기
                </Typography>
              </Box>
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  mt: 2,
                  mb: 2,
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark,
                  },
                  boxShadow: '0 8px 16px -4px rgba(33, 150, 243, 0.3)',
                }}
                startIcon={isLoading ? null : <LoginIcon />}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  '로그인'
                )}
              </Button>
              
              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  또는
                </Typography>
              </Divider>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => alert('관리자 문의')}
                >
                  관리자 문의
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => alert('접근 요청')}
                >
                  접근 요청
                </Button>
              </Box>
            </Box>
          </Box>
        </Card>
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
          © {new Date().getFullYear()} 관리자 시스템. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Login; 