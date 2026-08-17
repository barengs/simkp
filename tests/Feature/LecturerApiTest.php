<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LecturerApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_lecturer_endpoint_exists()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/lecturer');

        $response->assertStatus(200);
    }
}
