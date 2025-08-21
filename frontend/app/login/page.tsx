"use client"
import {useState} from "react";
import router from "next/router";
import { useRouter } from "next/navigation";

export default function Login() 
{
    const BACKEND_PORT = process.env.BACKEND_PORT ?? '3001';
    const BACKEND_URL = process.env.BACKEND_URL ? `${process.env.BACKEND_URL}${BACKEND_PORT}` : `http://localhost:${BACKEND_PORT}`; 
    const [error, setError] = useState<string>("");
    const [formData,setFormData] = useState({username:"", password:"",});
    const router = useRouter(); 
    const handleFormDatachange = (e: React.ChangeEvent<HTMLInputElement>) => 
    {
        setFormData({...formData, [e.target.name]: e.target.value});
    };
    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => 
    {
        e.preventDefault();
        setError('');
        const url = `${BACKEND_URL}/auth/login-jwt`;
        alert(url);
        try 
        {
            const res = await fetch(url, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({username: formData.username, password: formData.password})});
            const data = await res.json();
            alert(JSON.stringify(data));
            if(res.ok)
            {
                localStorage.setItem('access_token', data.access_token);
                router.push('/profile');
            }
            else 
            {
                console.error('Jwt Login Failed: ', data);
                setError(data?.error ?? 'Unknown Error');
            }
        }
        catch(err)
        {
            console.error('Unexpected Error', err);
            setError('Could not connect to server');
        }

    };

    return (
    <>
    <h1>Login</h1>
    <h3>{error}</h3>
    {/* <button type="submit" onSubmit={handleLogin}>Sign with Google</button> */}
    <form onSubmit={handleLogin}>
        <label htmlFor="username">Username</label>
        <input type="text" id="username" name="username" required value={formData.username} onChange={handleFormDatachange}></input>
        <label htmlFor="password">Password</label>
        <input type="password" id="password" name="password" required value={formData.password} onChange={handleFormDatachange}></input>
        <button type="submit">Sign In</button>
    </form>
    </>
    );
}