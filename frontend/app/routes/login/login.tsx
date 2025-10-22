import { Button, Label, TextInput, Card, Checkbox } from 'flowbite-react';
import { useState } from 'react';

function AuthPage() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSignUp) {
            console.log('Signing up:', { email, password, confirmPassword });
        } else {
            console.log('Signing in:', { email, password });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6">
                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <TextInput
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="password">Password</Label>
                        <TextInput
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {isSignUp && (
                        <div>
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <TextInput
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    <Button type="submit">
                        {isSignUp ? 'Sign Up' : 'Sign In'}
                    </Button>
                    <p className="text-sm text-center">
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <button
                            type="button"
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-blue-600 hover:underline font-medium"
                        >
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </button>
                    </p>
                </form>
            </Card>
        </div>
    );
}

export default AuthPage;